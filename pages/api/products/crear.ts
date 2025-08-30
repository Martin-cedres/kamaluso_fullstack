import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import clientPromise from "../../../lib/mongodb";
import { requireAuth } from "../../../lib/auth";

export const config = { api: { bodyParser: false } };

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadFileToS3 = async (file: formidable.File) => {
  if (!file.filepath) throw new Error("Archivo no válido");
  const buffer = fs.readFileSync(file.filepath);
  const ext = path.extname(file.originalFilename || "");
  const key = `productos/${uuidv4()}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    })
  );
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: `Método ${req.method} no permitido` });

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res
        .status(400)
        .json({ error: "Error al procesar formulario", detalles: err.message });

    try {
      const filePrincipal = Array.isArray(files.image) ? files.image[0] : files.image;
      if (!filePrincipal) return res.status(400).json({ error: "Falta la imagen principal" });

      const imagen = await uploadFileToS3(filePrincipal as formidable.File);

      let images: string[] = [];
      if (files.images) {
        const filesSecundarias = Array.isArray(files.images) ? files.images : [files.images];
        images = await Promise.all(filesSecundarias.map(f => uploadFileToS3(f as formidable.File)));
      }

      const client = await clientPromise;
      const db = client.db("kamaluso");

      const nuevoProducto: any = {
        nombre: Array.isArray(fields.nombre) ? fields.nombre[0] : fields.nombre,
        slug: Array.isArray(fields.slug) ? fields.slug[0] : fields.slug || "",
        descripcion: Array.isArray(fields.descripcion) ? fields.descripcion[0] : fields.descripcion || "",
        categoria: Array.isArray(fields.categoria) ? fields.categoria[0] : fields.categoria || "sublimable",
        subcategoria: Array.isArray(fields.subcategoria) ? fields.subcategoria[0] : fields.subcategoria || "",
        precio: parseFloat(Array.isArray(fields.precio) ? fields.precio[0] : fields.precio) || 0,
        precioFlex: parseFloat(Array.isArray(fields.precioFlex) ? fields.precioFlex[0] : fields.precioFlex) || 0,
        precioDura: parseFloat(Array.isArray(fields.precioDura) ? fields.precioDura[0] : fields.precioDura) || 0,
        tapa: Array.isArray(fields.tapa) ? fields.tapa[0] : fields.tapa || "flex",
        seoTitle: Array.isArray(fields.seoTitle) ? fields.seoTitle[0] : fields.seoTitle || "",
        seoDescription: Array.isArray(fields.seoDescription) ? fields.seoDescription[0] : fields.seoDescription || "",
        seoKeywords: Array.isArray(fields.seoKeywords) ? fields.seoKeywords[0] : fields.seoKeywords || "",
        alt: Array.isArray(fields.alt) ? fields.alt[0] : fields.alt || "",
        notes: Array.isArray(fields.notes) ? fields.notes[0] : fields.notes || "",
        status: Array.isArray(fields.status) ? fields.status[0] : fields.status || "activo",
        destacado: Array.isArray(fields.destacado)
          ? fields.destacado[0] === "true"
          : fields.destacado === "true",
        imagen,
        images,
        creadoEn: new Date(),
      };

      const result = await db.collection("products").insertOne(nuevoProducto);

      res.status(201).json({
        ok: true,
        mensaje: "Producto creado correctamente",
        id: result.insertedId,
        imagen,
        images,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({ error: "Error interno al guardar el producto" });
    }
  });
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}
