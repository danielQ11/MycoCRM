/**
 * Siembra de clientes de demostración para MycoCRM.
 *
 * - Conserva los clientes existentes.
 * - Completa la base hasta TARGET_TOTAL (300 por defecto).
 * - Genera nombres, teléfonos y correos plausibles de Antioquia.
 * - Reubica en el Valle de Aburrá los clientes que estén en municipios lejanos.
 * - Es idempotente: si ya hay suficientes clientes, no inserta más.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-clientes.mjs
 *
 * Para cambiar el total:
 *   SEED_TARGET=250 node --env-file=.env.local scripts/seed-clientes.mjs
 */
import { MongoClient } from "mongodb";
import { randomInt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const TARGET_TOTAL = Number(process.env.SEED_TARGET || 300);

// ─── Datos base ───

const MALE_FIRST = [
  "Juan", "José", "Carlos", "Andrés", "Santiago", "Sebastián", "Daniel",
  "Felipe", "Alejandro", "Miguel", "Esteban", "Camilo", "Luis", "Diego",
  "Fernando", "Mauricio", "Óscar", "Jhon", "Wilmar", "Yeison", "Duván",
  "Brayan", "Nicolás", "Mateo", "Samuel", "Tomás", "Emiliano", "Cristian",
  "Julián", "Kevin", "Manuel", "Nelson", "Iván", "Efraín", "Robinson",
  "Stiven", "Anderson", "Yohan", "Deiby", "Wilmer", "David", "Pablo",
  "Ricardo", "Jorge", "Alberto",
];

const FEMALE_FIRST = [
  "María", "Ana", "Laura", "Valentina", "Daniela", "Camila", "Isabella",
  "Sofía", "Mariana", "Paula", "Andrea", "Carolina", "Juliana", "Natalia",
  "Marcela", "Diana", "Claudia", "Luz", "Sandra", "Mónica", "Alejandra",
  "Catalina", "Manuela", "Salomé", "Verónica", "Stefany", "Yuliana",
  "Elena", "Rosa", "Marta", "Patricia", "Adriana", "Fernanda", "Lucía",
  "Gabriela", "Sara", "Erika", "Lorena", "Viviana", "Tatiana",
];

const MALE_COMPOUND = [
  "Juan Pablo", "Juan David", "Juan José", "Juan Esteban", "Juan Camilo",
  "Juan Sebastián", "Luis Miguel", "Luis Fernando", "Carlos Mario",
  "Carlos Andrés", "Andrés Felipe", "Jhon Alexander", "Jhon Fredy",
  "José Luis", "Diego Alejandro", "Sebastián Andrés", "Miguel Ángel",
  "Óscar Iván", "Wilmar Andrés", "Yeison Andrés",
];

const FEMALE_COMPOUND = [
  "María José", "María Camila", "María Fernanda", "María Alejandra",
  "María Paula", "María Isabel", "Ana María", "Ana Lucía", "Laura Sofía",
  "Laura Cristina", "Luz Elena", "Luz Marina", "Sandra Milena",
  "Diana Marcela", "Carolina Andrea", "Juliana Andrea", "Valentina Andrea",
  "Paula Andrea", "Catalina María", "Sofía Isabel",
];

const SURNAMES = [
  "Restrepo", "Gómez", "Rodríguez", "Martínez", "García", "López",
  "Hernández", "Ramírez", "Zapata", "Ospina", "Arango", "Betancur",
  "Giraldo", "Montoya", "Castaño", "Uribe", "Vélez", "Mejía", "Correa",
  "Quintero", "Salazar", "Ríos", "Álvarez", "Bedoya", "Osorio", "Muñoz",
  "Herrera", "Jiménez", "Agudelo", "Acevedo", "Arboleda", "Areiza",
  "Arias", "Barrientos", "Bernal", "Bustamante", "Cadavid", "Cano",
  "Cardona", "Carvajal", "Castrillón", "Ceballos", "Cifuentes",
  "Córdoba", "Cuartas", "Echeverri", "Escobar", "Estrada", "Flórez",
  "Franco", "Galeano", "Gallo", "González", "Grisales", "Guerra",
  "Gutiérrez", "Henao", "Holguín", "Hoyos", "Jaramillo", "Londoño",
  "Madrid", "Marín", "Maya", "Medina", "Mesa", "Mora", "Moreno",
  "Mosquera", "Naranjo", "Ochoa", "Orozco", "Ortega", "Pabón",
  "Paniagua", "Patiño", "Peláez", "Pérez", "Piedrahita", "Posada",
  "Rendón", "Rivas", "Rivera", "Rojas", "Román", "Ruiz", "Sánchez",
  "Santa", "Sepúlveda", "Sierra", "Suárez", "Tamayo", "Tobón", "Torres",
  "Trejos", "Valencia", "Vanegas", "Vargas", "Vásquez", "Velásquez",
  "Villa", "Villada",
];

// Solo municipios del Valle de Aburrá y alrededores cercanos.
const CITIES = [
  { name: "Medellín", weight: 40 },
  { name: "Envigado", weight: 16 },
  { name: "Itagüí", weight: 13 },
  { name: "Sabaneta", weight: 10 },
  { name: "Bello", weight: 8 },
  { name: "La Estrella", weight: 5 },
  { name: "Caldas", weight: 4 },
  { name: "Copacabana", weight: 2 },
  { name: "Girardota", weight: 1 },
  { name: "Barbosa", weight: 1 },
];

const DOMAINS = [
  { name: "gmail.com", weight: 70 },
  { name: "hotmail.com", weight: 15 },
  { name: "outlook.com", weight: 10 },
  { name: "yahoo.com", weight: 5 },
];

const PHONE_PREFIXES = [
  "300", "301", "302", "303", "304", "305", "310", "311", "312", "313",
  "314", "315", "316", "317", "318", "319", "320", "321", "322", "323",
  "324", "350", "351", "352", "353",
];

const START_DATE = new Date("2025-12-01T00:00:00-05:00");
const END_DATE = new Date();

// ─── Utilidades ───

function pick(list) {
  return list[randomInt(list.length)];
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let value = randomInt(total);
  for (const item of items) {
    if (value < item.weight) return item.name;
    value -= item.weight;
  }
  return items[items.length - 1].name;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function slug(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "");
}

function generateName(usedNames) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const isMale = randomInt(2) === 0;
    const firstNames = isMale ? MALE_FIRST : FEMALE_FIRST;
    const compoundNames = isMale ? MALE_COMPOUND : FEMALE_COMPOUND;

    let given;
    if (randomInt(100) < 30) {
      given = pick(compoundNames);
    } else {
      const first = pick(firstNames);
      if (randomInt(100) < 30) {
        let second = pick(firstNames);
        let guard = 0;
        while (second === first && guard < 20) {
          second = pick(firstNames);
          guard += 1;
        }
        given = `${first} ${second}`;
      } else {
        given = first;
      }
    }

    const surnameCount = randomInt(100) < 72 ? 2 : 1;
    const surnames = [];
    while (surnames.length < surnameCount) {
      const surname = pick(SURNAMES);
      if (!surnames.includes(surname)) surnames.push(surname);
    }

    const name = `${given} ${surnames.join(" ")}`.replace(/\s+/g, " ").trim();
    const key = normalizeText(name);
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return name;
    }
  }

  throw new Error("No se pudo generar un nombre único");
}

function generatePhone(usedPhones) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const prefix = pick(PHONE_PREFIXES);
    const rest = String(randomInt(0, 10_000_000)).padStart(7, "0");
    const phone = `${prefix}${rest}`;
    if (!usedPhones.has(phone)) {
      usedPhones.add(phone);
      return phone;
    }
  }

  throw new Error("No se pudo generar un teléfono único");
}

function generateEmail(name, usedEmails) {
  const parts = name.split(/\s+/);
  const first = slug(parts[0]);
  const last = slug(parts[parts.length - 1]);
  const secondLast = parts.length >= 3 ? slug(parts[parts.length - 2]) : last;
  const domain = pickWeighted(DOMAINS);

  for (let attempt = 0; attempt < 200; attempt++) {
    const number = randomInt(1, 1000);
    const style = randomInt(100);
    let local;

    if (style < 50) local = `${first}.${last}${number}`;
    else if (style < 75) local = `${first}${last}${number}`;
    else if (style < 88) local = `${first}_${last}${number}`;
    else if (style < 96) local = `${first}.${secondLast}${number}`;
    else local = `${first}${number}`;

    const email = `${local}@${domain}`.toLowerCase();
    if (!usedEmails.has(email)) {
      usedEmails.add(email);
      return email;
    }
  }

  const fallback = `${first}.${last}.${Date.now()}@${domain}`.toLowerCase();
  usedEmails.add(fallback);
  return fallback;
}

function generateDate() {
  // Ligeramente sesgada hacia fechas recientes.
  const ratio = Math.pow(Math.random(), 0.85);
  return new Date(
    START_DATE.getTime() + ratio * (END_DATE.getTime() - START_DATE.getTime())
  );
}

// ─── Siembra ───

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Falta MONGODB_URI. Ejecuta: node --env-file=.env.local scripts/seed-clientes.mjs"
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();

    const dbName = new URL(uri).pathname.replace(/^\//, "") || "crm-clientes";
    const db = client.db(dbName);
    const collection = db.collection("clientes");

    const existing = await collection.find({}).toArray();

    // Respaldo previo en /tmp/opencode (no se sube al repositorio).
    const backupDir = "/tmp/opencode";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `clientes-backup-${stamp}.json`);
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");

    // Reubicar clientes de municipios lejanos dentro del Valle de Aburrá.
    const allowedCities = new Set(CITIES.map((city) => city.name));
    const cityUpdates = [];

    for (const doc of existing) {
      const city = String(doc.ciudad || "").trim();
      if (!allowedCities.has(city)) {
        cityUpdates.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { ciudad: pickWeighted(CITIES) } },
          },
        });
      }
    }

    if (cityUpdates.length > 0) {
      await collection.bulkWrite(cityUpdates);
    }

    const usedNames = new Set(
      existing.map((doc) => normalizeText(doc.nombre)).filter(Boolean)
    );
    const usedPhones = new Set(
      existing
        .map((doc) => String(doc.telefono || "").replace(/\D/g, ""))
        .filter(Boolean)
    );
    const usedEmails = new Set(
      existing
        .map((doc) => String(doc.correo || "").trim().toLowerCase())
        .filter(Boolean)
    );

    const toInsert = Math.max(0, TARGET_TOTAL - existing.length);
    const newClients = [];

    for (let i = 0; i < toInsert; i += 1) {
      const nombre = generateName(usedNames);
      newClients.push({
        nombre,
        telefono: generatePhone(usedPhones),
        correo: generateEmail(nombre, usedEmails),
        ciudad: pickWeighted(CITIES),
        estado: randomInt(100) < 12 ? "Inactivo" : "Activo",
        fechaRegistro: generateDate(),
        __v: 0,
      });
    }

    if (newClients.length > 0) {
      await collection.insertMany(newClients, { ordered: false });
    }

    const finalCount = await collection.countDocuments();
    const byCity = await collection
      .aggregate([
        { $group: { _id: "$ciudad", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ])
      .toArray();
    const byState = await collection
      .aggregate([
        { $group: { _id: "$estado", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    console.log(`Respaldo: ${backupPath}`);
    console.log(`Ciudades reubicadas: ${cityUpdates.length}`);
    console.log(`Clientes insertados: ${newClients.length}`);
    console.log(`Total final: ${finalCount}`);
    console.log(
      `Por ciudad: ${byCity
        .map((item) => `${item._id}: ${item.count}`)
        .join(" | ")}`
    );
    console.log(
      `Por estado: ${byState
        .map((item) => `${item._id}: ${item.count}`)
        .join(" | ")}`
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Error en la siembra:", error.message);
  process.exitCode = 1;
});
