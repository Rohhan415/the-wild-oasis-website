import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({ subsets: ["latin"], display: "swap" });

import "@/app/_styles/globals.css";
import Header from "./_components/Header";
import { ReservationProvider } from "./_components/ReservaitonContext";

export const metadata = {
  // title: "The Wild Oasis",
  title: {
    template: "%s - The Wild Oasis",
    default: "Welcome - The Wild Oasis",
  },
  description:
    " Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by stunning mountain views.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased min-h-screen bg-primary-950 text-primary-100 flex flex-col relative `}
      >
        <Header />

        <div className="grid flex-1 px-8 py-12 ">
          <main className="w-full mx-auto max-w-7xl">
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
