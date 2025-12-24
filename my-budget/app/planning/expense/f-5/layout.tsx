// app/planning/expense/f-5/layout.tsx
import React from 'react'

export default function F5Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ลบ flex, aside, sidebar ออกให้หมด
    <div className="min-h-screen bg-gray-50">
       {children}
    </div>
  )
}