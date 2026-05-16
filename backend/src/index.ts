import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'boda-secret-key';

app.use(cors());
app.use(express.json());

// --- Authentication Endpoints ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { phone, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        role: role || 'CUSTOMER',
      },
    });

    if (role === 'RIDER') {
      await prisma.riderProfile.create({
        data: {
          userId: user.id,
          plateNumber: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, phone: user.phone, role: user.role, name: user.name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Trip Endpoints ---

// Request a ride (Customer or Guest)
app.post('/api/trips/request', async (req, res) => {
  const { customerId, guestName, guestPhone, pickupLocation, destination, price } = req.body;
  try {
    const trip = await prisma.trip.create({
      data: {
        customerId: customerId || null,
        guestName,
        guestPhone,
        pickupLocation,
        destination,
        price,
        status: 'SEARCHING',
      },
    });
    res.status(201).json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get available trips (Rider)
app.get('/api/trips/available', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'SEARCHING' },
      include: { customer: { select: { name: true, phone: true } } },
    });
    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept a trip (Rider)
app.patch('/api/trips/:id/accept', async (req, res) => {
  const { id } = req.params;
  const { riderId } = req.body;
  try {
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        riderId,
        status: 'ACCEPTED',
      },
    });
    res.json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get trip details
app.get('/api/trips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { 
        rider: { include: { user: { select: { name: true } } } },
        customer: { select: { name: true } }
      },
    });
    res.json(trip);
  } catch (error: any) {
    res.status(404).json({ error: 'Trip not found' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
