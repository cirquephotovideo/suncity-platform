import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertProduct } from '../actions';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProduct() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertProduct(null, fd); redirect(`/admin/products/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouveau produit</h1><ProductForm action={action} /></div>;
}
