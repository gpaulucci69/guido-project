export type AvatarObject = { key: string; mimeType: string; bytes: Uint8Array };
import { Client } from "minio";

export interface AvatarStorage {
  put(object: AvatarObject): Promise<void>;
  delete(key: string): Promise<void>;
  signedUrl(key: string): Promise<string>;
}

/** Port used by the business service. The concrete MinIO adapter is supplied by the runtime. */
export class MinioAvatarStorage implements AvatarStorage {
  private readonly client: Client;
  private readonly publicClient: Client;
  private readonly bucket: string;
  constructor(bucket = process.env.MINIO_BUCKET ?? "saas-profile-avatars") {
    const endpoint = new URL(
      process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
    );
    this.bucket = bucket;
    this.client = new Client({
      endPoint: endpoint.hostname,
      port: Number(
        endpoint.port || (endpoint.protocol === "https:" ? 443 : 80),
      ),
      useSSL: endpoint.protocol === "https:",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "minioadminsecret",
    });
    const publicEndpoint = new URL(
      process.env.MINIO_PUBLIC_ENDPOINT ?? "http://localhost:9000",
    );
    this.publicClient = new Client({
      endPoint: publicEndpoint.hostname,
      port: Number(
        publicEndpoint.port ||
          (publicEndpoint.protocol === "https:" ? 443 : 80),
      ),
      useSSL: publicEndpoint.protocol === "https:",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "minioadminsecret",
      region: "us-east-1",
    });
  }
  async put(object: AvatarObject): Promise<void> {
    if (!(await this.client.bucketExists(this.bucket)))
      await this.client.makeBucket(this.bucket);
    await this.client.putObject(
      this.bucket,
      object.key,
      Buffer.from(object.bytes),
      object.bytes.byteLength,
      { "Content-Type": object.mimeType },
    );
  }
  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
  async signedUrl(key: string): Promise<string> {
    return this.publicClient.presignedGetObject(this.bucket, key, 300);
  }
}
