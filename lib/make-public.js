const { S3Client, PutObjectAclCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: "sa-east-1" });
const bucket = "strapi-bucket-kamaluso";

async function makeAllPublic(prefix) {
  const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  if (list.Contents) {
    for (const obj of list.Contents) {
      if (obj.Key) {
        await s3.send(new PutObjectAclCommand({
          Bucket: bucket,
          Key: obj.Key,
          ACL: "public-read"
        }));
        console.log(`Hecho público: ${obj.Key}`);
      }
    }
  }
}

(async () => {
  await makeAllPublic("uploads/");
  await makeAllPublic("processed/");
  console.log("Todos los archivos ahora son públicos");
})();
