import { verifyAdminSession } from '@/lib/dal';
import { getAdminDestinations } from '@/lib/actions/destinations';
import DestinationForm from '@/components/admin/DestinationForm';

export const metadata = { title: 'New Destination' };

export default async function NewDestinationPage() {
  await verifyAdminSession();
  const { items: allDestinations } = await getAdminDestinations();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Destination</h1>
      <DestinationForm allDestinations={allDestinations} />
    </div>
  );
}
