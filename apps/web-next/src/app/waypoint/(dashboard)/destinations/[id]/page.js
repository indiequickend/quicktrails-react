import { notFound } from 'next/navigation';
import { verifyAdminSession } from '@/lib/dal';
import { getDestinationById, getAdminDestinations } from '@/lib/actions/destinations';
import DestinationForm from '@/components/admin/DestinationForm';

export const metadata = { title: 'Edit Destination' };

export default async function EditDestinationPage({ params }) {
  await verifyAdminSession();
  const { id } = await params;
  const [destination, { items: allDestinations }] = await Promise.all([
    getDestinationById(id),
    getAdminDestinations(),
  ]);
  if (!destination) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit — {destination.name}</h1>
      <DestinationForm
        destination={destination}
        allDestinations={allDestinations.filter(d => d._id !== id)}
      />
    </div>
  );
}
