import { prisma } from '../db/client';

export async function getDescendantRegionIds(regionId: string): Promise<string[]> {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
    select: { 
      id: true, 
      children: { 
        select: { 
          id: true, 
          children: { 
            select: { 
              id: true, 
              children: { select: { id: true } } 
            } 
          } 
        } 
      } 
    }
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

export async function getAncestorRegionIds(regionId: string): Promise<string[]> {
  const ancestors: string[] = [];
  let currentId: string | null = regionId;

  while (currentId) {
    const region: any = await prisma.region.findUnique({
      where: { id: currentId },
      select: { id: true, parentId: true }
    });
    
    if (!region) break;
    ancestors.push(region.id);
    currentId = region.parentId;
    
    // Safety break to prevent infinite loops if data is corrupted
    if (ancestors.length > 10) break;
  }

  return ancestors;
}
