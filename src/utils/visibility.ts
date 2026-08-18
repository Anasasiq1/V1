import { AppData, Module, Category, Product, PromoBanner } from '../types';

/**
 * Checks if a Module is actively enabled.
 */
export function isModuleActive(module?: Module | null): boolean {
  if (!module) return false;
  return module.active !== false;
}

/**
 * Checks if a Category is actively enabled, AND its parent module is enabled.
 */
export function isCategoryActive(
  category?: Category | null,
  allModules: Module[] = []
): boolean {
  if (!category) return false;
  if (category.active === false) return false;

  // If category is linked to a module, that module MUST be active
  if (category.moduleId) {
    const parentModule = allModules.find((m) => m.id === category.moduleId);
    if (parentModule && parentModule.active === false) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a Product is actively available, AND its parent module and category are active.
 * Hierarchy: Module active -> Category active -> Product available.
 */
export function isProductActive(
  product?: Product | null,
  allCategories: Category[] = [],
  allModules: Module[] = []
): boolean {
  if (!product) return false;
  if (product.available === false) return false;

  // Check parent module
  if (product.moduleId) {
    const parentModule = allModules.find((m) => m.id === product.moduleId);
    if (parentModule && parentModule.active === false) {
      return false;
    }
  }

  // Check parent category
  if (product.categoryId) {
    const parentCategory = allCategories.find((c) => c.id === product.categoryId);
    if (parentCategory) {
      if (!isCategoryActive(parentCategory, allModules)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Returns all active modules sorted by their display order.
 */
export function getActiveModules(modules: Module[] = []): Module[] {
  return [...modules]
    .filter((m) => isModuleActive(m))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Returns all active categories, optionally filtered by a specific moduleId.
 */
export function getActiveCategories(
  categories: Category[] = [],
  modules: Module[] = [],
  moduleId?: string
): Category[] {
  return [...categories]
    .filter((c) => {
      if (!isCategoryActive(c, modules)) return false;
      if (moduleId && moduleId !== 'all' && c.moduleId !== moduleId) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Centralized selector for customer-facing visible products.
 * Filters strictly according to Module -> Category -> Product availability rules,
 * plus optional module selection and search query.
 */
export function getVisibleProducts(
  products: Product[] = [],
  categories: Category[] = [],
  modules: Module[] = [],
  activeModuleId: string = 'all',
  searchQuery: string = ''
): Product[] {
  const activeCategoryIds = new Set(
    getActiveCategories(categories, modules).map((c) => c.id)
  );

  return [...products]
    .filter((product) => {
      // 1. Fundamental Hierarchy Check
      if (!isProductActive(product, categories, modules)) {
        return false;
      }

      // If product has a categoryId, verify category is active
      if (product.categoryId && !activeCategoryIds.has(product.categoryId)) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const category = categories.find((c) => c.id === product.categoryId);
        const module = modules.find((m) => m.id === product.moduleId);

        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchCat = category?.name.toLowerCase().includes(q);
        const matchMod = module?.name.toLowerCase().includes(q);

        if (!matchName && !matchDesc && !matchCat && !matchMod) {
          return false;
        }
      }

      // 3. Active Module Selection Filter
      if (activeModuleId !== 'all') {
        const moduleCategoryIds = new Set(
          categories
            .filter((c) => c.moduleId === activeModuleId && isCategoryActive(c, modules))
            .map((c) => c.id)
        );

        const matchesModule =
          product.moduleId === activeModuleId ||
          (product.categoryId && moduleCategoryIds.has(product.categoryId));

        if (!matchesModule) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Returns active promotional banners whose target module is also active.
 */
export function getVisibleBanners(
  banners: PromoBanner[] = [],
  modules: Module[] = []
): PromoBanner[] {
  const activeModuleIds = new Set(getActiveModules(modules).map((m) => m.id));

  return (banners || []).filter((banner) => {
    if (banner.active === false) return false;
    // If banner links to a module, ensure that module is currently active
    if (banner.linkModuleId && !activeModuleIds.has(banner.linkModuleId)) {
      return false;
    }
    return true;
  });
}

/**
 * Helper to sanitize or auto-fallback invalid or disabled module selection.
 */
export function sanitizeModuleSelection(
  selectedModuleId: string,
  modules: Module[] = []
): string {
  if (!selectedModuleId || selectedModuleId === 'all') {
    return 'all';
  }
  const targetModule = modules.find((m) => m.id === selectedModuleId);
  if (!targetModule || !isModuleActive(targetModule)) {
    return 'all';
  }
  return selectedModuleId;
}
