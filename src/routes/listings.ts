import { Router } from "express";
import { ObjectId, type Filter } from "mongodb";
import { listingsCollection, usersCollection } from "../db";
import type { Listing } from "../types";

const router = Router();

// Lo que se enseña de cada anuncio en un listado
const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

// ---------- GET /api/listings (listado, con filtros opcionales) ----------
router.get("/", async (req, res) => {
  const filter: Filter<Listing> = {};

  if (typeof req.query.category === "string") {
    filter.category = req.query.category;
  }

  if (typeof req.query.city === "string") {
    filter.city = req.query.city;
  }

  if (req.query.maxPrice !== undefined) {
    const maxPrice = Number(req.query.maxPrice);

    if (Number.isNaN(maxPrice)) {
      res.status(400).json({ error: "maxPrice tiene que ser un número" });
      return;
    }

    filter.price = { $lte: maxPrice };
  }

  const listings = await listingsCollection()
    .find(filter)
    .project(LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .toArray();

  res.json(listings);
});

// ---------- GET /api/listings/:id (ficha) ----------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "El id no tiene un formato válido" });
    return;
  }

  // Busca el anuncio y suma 1 a sus visitas en la misma operación
  const listing = await listingsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } },
    { returnDocument: "after" },
  );

  if (!listing) {
    res.status(404).json({ error: "No existe ningún anuncio con ese id" });
    return;
  }

  res.json(listing);
});

// ---------- POST /api/listings (publicar) ----------
router.post("/", async (req, res) => {
  const body = req.body ?? {};

  // title, description, category y city: obligatorios, texto no vacío
  for (const field of ["title", "description", "category", "city"]) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      res.status(400).json({ error: `${field} es obligatorio y tiene que ser un texto` });
      return;
    }
  }

  // price: obligatorio, número mayor o igual que 0
  if (typeof body.price !== "number" || body.price < 0) {
    res.status(400).json({ error: "price tiene que ser un número mayor o igual que 0" });
    return;
  }

  // attributes: opcional; si llega, tiene que ser un objeto
  const attributes = body.attributes ?? {};
  if (typeof attributes !== "object" || Array.isArray(attributes)) {
    res.status(400).json({ error: "attributes tiene que ser un objeto" });
    return;
  }

  // sellerId: formato de ObjectId y tiene que existir en users
  if (typeof body.sellerId !== "string" || !ObjectId.isValid(body.sellerId)) {
    res.status(400).json({ error: "sellerId no tiene un formato válido" });
    return;
  }

  // MongoDB no comprueba las referencias: lo hacemos nosotros
  const seller = await usersCollection().findOne({ _id: new ObjectId(body.sellerId) });
  if (!seller) {
    res.status(400).json({ error: "No existe ningún usuario con ese sellerId" });
    return;
  }

  // Construimos el anuncio campo a campo: nunca guardamos req.body tal cual
  const listing: Listing = {
    title: body.title,
    description: body.description,
    price: body.price,
    category: body.category,
    status: "AVAILABLE",
    city: body.city,
    publishedAt: new Date(),
    views: 0,
    seller: { id: seller._id, name: seller.name },
    photos: [],
    attributes,
  };

  const result = await listingsCollection().insertOne(listing);

  res.status(201).json({ _id: result.insertedId, ...listing });
});

// ---------- PATCH /api/listings/:id (cambiar el precio) ----------
router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "El id no tiene un formato válido" });
    return;
  }

  // Solo cogemos price: cualquier otro campo del body se ignora
  const price = req.body?.price;
  if (typeof price !== "number" || price < 0) {
    res.status(400).json({ error: "price tiene que ser un número mayor o igual que 0" });
    return;
  }

  const listing = await listingsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { price } },
    { returnDocument: "after" },
  );

  if (!listing) {
    res.status(404).json({ error: "No existe ningún anuncio con ese id" });
    return;
  }

  res.json(listing);
});

// ---------- DELETE /api/listings/:id (borrar) ----------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "El id no tiene un formato válido" });
    return;
  }

  const result = await listingsCollection().deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "No existe ningún anuncio con ese id" });
    return;
  }

  res.status(204).end();
});

export default router;