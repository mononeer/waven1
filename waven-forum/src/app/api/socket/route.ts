import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

export async function GET() {
  return NextResponse.json({ message: 'Socket.IO server is ready' })
}

export async function POST() {
  return NextResponse.json({ message: 'Socket.IO endpoint' })
}