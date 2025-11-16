import '@fastify/multipart';
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    file(): Promise<{
      filename: string;
      mimetype: string;
      encoding: string;
      toBuffer(): Promise<Buffer>;
    } | null>;

    parts(): AsyncIterable<{
      type: 'file' | 'field';
      fieldname: string;
      filename?: string;
      encoding?: string;
      mimetype?: string;
      file?: AsyncIterable<Buffer>;
      value?: string;
    }>;
  }
}
