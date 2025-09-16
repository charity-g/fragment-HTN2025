import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Fragment GIF Display
        </h1>
        <div className="flex justify-center">
          <Image
            src="https://fragment-gifs.s3.us-east-1.amazonaws.com/test-lambda-s3-wiring_gif.gif"
            alt="Converted GIF from S3"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
