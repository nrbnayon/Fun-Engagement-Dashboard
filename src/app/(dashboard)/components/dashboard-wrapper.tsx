// src/app/(dashboard)/components/dashboard-wrapper.tsx
"use client";

import React from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconBrandTabler } from "@tabler/icons-react";
import { PiRanking } from "react-icons/pi";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LogOut, Newspaper, ScrollText, Trophy, Vote } from "lucide-react";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const links = [
    {
      label: "Overview",
      href: "/overview",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Player List",
      href: "/player-list",
      icon: (
        <ScrollText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Matchs",
      href: "/matchs",
      icon: (
        <Trophy className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Voting",
      href: "/voting",
      icon: (
        <Vote className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Fan Ranking",
      href: "/fan-ranking",
      icon: (
        <PiRanking
          size={18}
          className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"
        />
      ),
    },
    {
      label: "News",
      href: "news",
      icon: (
        <Newspaper className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700",
        "h-screen overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-card dark:bg-yellow-200">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo open={open} /> : <LogoIcon />}
            <div className="mt-10 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
            {/* <SidebarLink
              link={{
                label: "John Doe",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    N
                  </div>
                ),
              }}
            /> */}
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}

// const Logo = () => {
//   return (
//     <Link
//       href='/'
//       className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'
//     >
//       <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0' />
//       <motion.span
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className='font-medium text-black dark:text-white whitespace-pre'
//       >
//         Dumbarton Fan
//       </motion.span>
//     </Link>
//   );
// };

const Logo = ({ open }: { open: boolean }) => {
  return (
    <Link
      href="/overview"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 w-full"
    >
      {/* Fixed container for image to prevent jumping */}
      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
        <Image
          className="w-full h-full object-contain"
          alt="Dumbarton Fan Logo"
          src="/logo.png"
          width={36}
          height={36}
          style={{ width: "36px", height: "36px" }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "inline-block" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="font-medium text-lg font-oswald bg-gradient-to-b from-[#000002] to-[#F2CE171A] bg-clip-text text-transparent dark:text-white whitespace-pre overflow-hidden"
      >
        Dumbarton Fan
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    // <Link
    //   href='/'
    //   className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'
    // >
    //   <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0' />
    // </Link>
    <Link
      href="/overview"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 w-full"
    >
      {/* Fixed container for image to prevent jumping */}
      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
        <Image
          className="w-full h-full object-contain"
          alt="Dumbarton Fan Logo"
          src="/logo.png"
          width={36}
          height={36}
          style={{ width: "36px", height: "36px" }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
        }}
        transition={{ duration: 0.2 }}
        className="font-medium text-lg font-oswald bg-gradient-to-b from-[#000002] to-[#F2CE171A] bg-clip-text text-transparent dark:text-white whitespace-pre overflow-hidden"
      >
        Dumbarton Fan
      </motion.span>
    </Link>
  );
};

const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 bg-card min-h-0">
      <div className="p-0 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
