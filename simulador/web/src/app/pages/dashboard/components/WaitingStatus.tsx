"use client";

import React from "react";

export default function WaitingStatus() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
