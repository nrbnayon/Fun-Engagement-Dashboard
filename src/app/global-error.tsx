// src\app\global-error.tsx
"use client";

import errorImage from "@/public/error.png";
import Image from "next/image";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center w-4/5 mx-auto container my-8 py-9">
          <div className="w-1/4">
            <Image src={errorImage} alt="error" />
          </div>
          <div className="py-4">
            <h1 className="text-center text-2xl font-semibold text-red-500">
              {error.message}
            </h1>
            <div className="flex gap-3 justify-center my-4">
              <Link
                href="/"
                className="bg-teal-500 px-3 py-2 rounded text-white flex gap-2 items-center cursor-pointer"
              >
                <IoMdArrowBack />
                To Home
              </Link>
              <button
                onClick={() => reset()}
                className="bg-blue-500 px-3 py-2 rounded text-white flex gap-2 items-center cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
