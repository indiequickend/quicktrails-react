'use server';

import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import SiteConfig from '@/models/SiteConfig';
import { sendSelfPlanMail } from '@/lib/mail';

export async function submitSelfPlan(data) {
  const { guestName, email, phone, destinations, startDate, endDate, adults, childrenUnder8,
    stayPreference, stayBudgetAmount, stayBudgetType, rooms, foodVeg, foodNonVeg,
    carType, carAC, numberOfCars, specialRequests } = data;

  if (!guestName?.trim() || !email?.trim() || !phone?.trim()) {
    return { success: false, error: 'Name, email and phone are required.' };
  }
  if (!destinations?.length) {
    return { success: false, error: 'Please add at least one destination.' };
  }
  if (!startDate || !endDate) {
    return { success: false, error: 'Please select your travel dates.' };
  }
  if (!adults || adults < 1) {
    return { success: false, error: 'Please enter the number of adults.' };
  }

  await dbConnect();

  const config = await SiteConfig.findOne().lean();
  const discount = config?.selfPlanDiscount;
  const discountSnapshot = discount?.enabled && discount?.value > 0
    ? { type: discount.type, value: discount.value }
    : { type: 'none', value: 0 };

  await Booking.create({
    bookingType: 'self_plan',
    guestName: guestName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    destinations,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    adults: Number(adults),
    childrenUnder8: Number(childrenUnder8) || 0,
    stayPreference: stayPreference || '',
    stayBudget: {
      amount: stayBudgetAmount ? Number(stayBudgetAmount) : null,
      type: stayBudgetType || '',
    },
    rooms: Array.isArray(rooms) ? rooms : [],
    foodPreference: { veg: Number(foodVeg) || 0, nonVeg: Number(foodNonVeg) || 0 },
    carType: carType || '',
    carAC: carAC !== false,
    numberOfCars: Number(numberOfCars) || 1,
    specialRequests: specialRequests?.trim() || '',
    discountSnapshot,
  });

  sendSelfPlanMail({
    guestName, email, phone, destinations, startDate, endDate,
    adults: Number(adults), childrenUnder8: Number(childrenUnder8) || 0,
    stayPreference,
    stayBudgetAmount: stayBudgetAmount ? Number(stayBudgetAmount) : null,
    stayBudgetType: stayBudgetType || '',
    rooms: Array.isArray(rooms) ? rooms : [],
    foodVeg: Number(foodVeg) || 0, foodNonVeg: Number(foodNonVeg) || 0,
    carType, carAC: carAC !== false, numberOfCars, specialRequests, discountSnapshot,
  }).catch((err) => console.error('Self-plan mail failed:', err));

  return { success: true, discountSnapshot };
}
