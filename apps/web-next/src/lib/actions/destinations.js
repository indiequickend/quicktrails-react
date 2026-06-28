'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Destination from '@/models/Destination';
import { verifyAdminSession } from '@/lib/dal';
import { slugify } from '@/lib/slugify';

export async function getAdminDestinations() {
  await verifyAdminSession();
  await dbConnect();
  try {
    const items = await Destination.find().sort({ name: 1 }).lean();
    return { success: true, items: JSON.parse(JSON.stringify(items)) };
  } catch (err) {
    console.error('getAdminDestinations error:', err);
    return { success: false, items: [] };
  }
}

export async function getDestinationById(id) {
  await verifyAdminSession();
  await dbConnect();
  try {
    const doc = await Destination.findById(id).lean();
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  } catch {
    return null;
  }
}

export async function getPublicDestinations() {
  await dbConnect();
  try {
    const items = await Destination.find({ isActive: true }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

export async function getChildDestinations(parentSlug) {
  await dbConnect();
  try {
    const items = await Destination.find({ parentSlug, isActive: true }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

export async function getSiblingDestinations(parentSlug, excludeSlug) {
  await dbConnect();
  try {
    if (!parentSlug) return [];
    const items = await Destination.find({ parentSlug, isActive: true, slug: { $ne: excludeSlug } })
      .sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

export async function getPublicDestinationBySlug(slug) {
  await dbConnect();
  try {
    const doc = await Destination.findOne({ slug, isActive: true }).lean();
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  } catch {
    return null;
  }
}

export async function saveDestination(prevState, formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get('id');
  const name = String(formData.get('name') || '').trim();
  if (!name) return { error: 'Name is required.' };

  let slug = String(formData.get('slug') || '').trim();
  slug = slug ? slugify(slug) : slugify(name);

  const keywordsRaw = String(formData.get('keywords') || '');
  const keywords = keywordsRaw.split(',').map(s => s.trim()).filter(Boolean);

  const longTailRaw = String(formData.get('longTailKeywords') || '');
  const longTailKeywords = longTailRaw.split('\n').map(s => s.trim()).filter(Boolean);

  const data = {
    name,
    slug,
    tagline: String(formData.get('tagline') || '').trim(),
    description: String(formData.get('description') || ''),
    heroImage: String(formData.get('heroImage') || '').trim(),
    seoTitle: String(formData.get('seoTitle') || '').trim(),
    seoDescription: String(formData.get('seoDescription') || '').trim(),
    focusKeyword: String(formData.get('focusKeyword') || '').trim(),
    keywords,
    longTailKeywords,
    isActive: formData.get('isActive') === 'true',
    parentSlug: String(formData.get('parentSlug') || '').trim(),
  };

  if (id) {
    await Destination.findByIdAndUpdate(id, data);
  } else {
    await Destination.create(data);
  }

  revalidatePath('/destination/' + slug);
  revalidatePath('/waypoint/destinations');
  redirect('/waypoint/destinations');
}

export async function deleteDestination(formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get('id');
  const doc = await Destination.findById(id).lean();
  if (doc) {
    await Destination.findByIdAndDelete(id);
    revalidatePath('/destination/' + doc.slug);
  }
  revalidatePath('/waypoint/destinations');
  redirect('/waypoint/destinations');
}
