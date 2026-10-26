'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard/products')
    } else {
      router.replace('/login')
    }
  }, [router])

  return null
}
