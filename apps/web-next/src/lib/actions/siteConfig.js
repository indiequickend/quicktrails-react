'use server';

import dbConnect from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import { verifyAdminSession } from '@/lib/dal';
import { revalidatePath } from 'next/cache';

export async function getSiteConfig() {
  await dbConnect();
  const config = await SiteConfig.findOne().lean();
  if (!config) return { selfPlanDiscount: { enabled: false, type: 'percentage', value: 5 } };
  return JSON.parse(JSON.stringify(config));
}

export async function updateSelfPlanDiscount(data) {
  await verifyAdminSession();
  await dbConnect();
  await SiteConfig.findOneAndUpdate(
    {},
    { $set: { selfPlanDiscount: data } },
    { upsert: true, new: true }
  );
  revalidatePath('/plan-your-trip');
  revalidatePath('/waypoint/settings');
  return { success: true };
}
