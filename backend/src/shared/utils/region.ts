import { prisma } from '../db/client';

export async function getDescendantRegionIds(regionId: string): Promise<string[]> {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
    include: { children: { include: { children: { include: { children: true } } } } }
  });

  if (!region) return [];

  const ids: string[] = [region.id];
  
  const traverse = (r: any) => {
    if (r.children) {
      for (const child of r.children) {
        ids.push(child.id);
        traverse(child);
      }
    }
  };

  traverse(region);
  return ids;
}
