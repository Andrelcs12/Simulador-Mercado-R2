import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/home",
        destination: "/"
      },
      {
        source: "/cadastro",
        destination: "/pages/registro-do-usuario"
      },
      {
        source: "/admin/setup",
        destination: "/pages/admin/dashboard/setup"
        
      },
       {
        source: "/admin/lobby",
        destination: "/pages/admin/dashboard/setup"
      },
      {
        source: "/onboarding",
        destination: "/pages/onboarding"
      },
      {
        source: "/lobby",
        destination: "/pages/lobby"
      },
      {
        source: "/admin/lobby",
        destination: "/pages/admin/dashboard"
      },
      {
        source: "/result/loading",
        destination: "/pages/onboarding/processing"
      },
      {
        source: "/result",
        destination: "/pages/dashboard"
      },



    ]
  }

};

export default nextConfig;
