import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const specialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name: 'Cardiology' },
      update: {},
      create: { name: 'Cardiology', description: 'Heart and cardiovascular health', avgDurationMin: 30 },
    }),
    prisma.specialty.upsert({
      where: { name: 'Dermatology' },
      update: {},
      create: { name: 'Dermatology', description: 'Skin and dermatological care', avgDurationMin: 20 },
    }),
    prisma.specialty.upsert({
      where: { name: 'Neurology' },
      update: {},
      create: { name: 'Neurology', description: 'Nervous system disorders', avgDurationMin: 40 },
    }),
    prisma.specialty.upsert({
      where: { name: 'Orthopedics' },
      update: {},
      create: { name: 'Orthopedics', description: 'Bones and joints', avgDurationMin: 30 },
    }),
    prisma.specialty.upsert({
      where: { name: 'Pediatrics' },
      update: {},
      create: { name: 'Pediatrics', description: 'Children and infant health', avgDurationMin: 25 },
    }),
    prisma.specialty.upsert({
      where: { name: 'Psychiatry' },
      update: {},
      create: { name: 'Psychiatry', description: 'Mental health and behavioral care', avgDurationMin: 45 },
    }),
  ]);

  const doctors = [];
  for (const spec of specialties) {
    for (let i = 1; i <= 2; i++) {
      const doctor = await prisma.doctor.upsert({
        where: { id: `${spec.id}-doctor-${i}` },
        update: {},
        create: {
          id: `${spec.id}-doctor-${i}`,
          name: `Dr. ${spec.name} ${String.fromCharCode(64 + i)}`,
          specialtyId: spec.id,
          yearsExperience: 5 + i * 5,
          rating: 4.5 + (i % 2) * 0.3,
          bio: `Experienced ${spec.name.toLowerCase()} specialist with ${5 + i * 5} years of practice.`,
        },
      });
      doctors.push(doctor);
    }
  }

  for (const doctor of doctors) {
    for (let weekday = 1; weekday <= 5; weekday++) {
      await prisma.doctorAvailability.upsert({
        where: {
          doctorId_weekday_startTime_endTime: {
            doctorId: doctor.id,
            weekday,
            startTime: '09:00',
            endTime: '17:00',
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          weekday,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
    }
  }

  console.log('✓ Seeded 6 specialties, 12 doctors, availability');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
