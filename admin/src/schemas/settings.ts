import { z } from 'zod'

export const brandingSchema = z.object({
  mainLogo: z.string().url('Invalid logo URL').optional(),
  darkLogo: z.string().url('Invalid dark logo URL').optional(),
  lightLogo: z.string().url('Invalid light logo URL').optional(),
  favicon: z.string().url('Invalid favicon URL').optional(),
  appleTouchIcon: z.string().url('Invalid apple touch icon URL').optional(),
  loginPageLogo: z.string().url('Invalid login logo URL').optional(),
})

export const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  successColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  warningColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  errorColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  sidebarColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  headerColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  cardColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  buttonColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  fontFamily: z.string().min(1, 'Font family required'),
  headingFont: z.string().min(1, 'Heading font required'),
  bodyFont: z.string().min(1, 'Body font required'),
  sidebarWidth: z.number().min(200).max(400),
  cardBorderRadius: z.number().min(0).max(30),
  containerWidth: z.number().min(800).max(1600),
  isCollapsedDefault: z.boolean(),
  isFixedHeader: z.boolean(),
  isFixedSidebar: z.boolean(),
  themeMode: z.enum(['light', 'dark', 'system']),
})

export const seoSchema = z.object({
  defaultMetaTitle: z.string().min(1).max(60, 'Max 60 characters'),
  defaultMetaDescription: z.string().min(1).max(160, 'Max 160 characters'),
  defaultKeywords: z.string(),
  robotsMetaTag: z.string(),
  openGraphTitle: z.string().optional(),
  openGraphDescription: z.string().optional(),
  openGraphImage: z.string().url().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterCardImage: z.string().url().optional(),
  sitemapURL: z.string().url().optional(),
  robotsTxt: z.string(),
  canonicalURL: z.string().url().optional(),
  googleVerificationCode: z.string().optional(),
  bingVerificationCode: z.string().optional(),
})

export const paymentsSchema = z.object({
  status: z.enum(['coming-soon', 'active']),
})

export type BrandingSettings = z.infer<typeof brandingSchema>
export type ThemeSettings = z.infer<typeof themeSchema>
export type SEOSettings = z.infer<typeof seoSchema>
export type PaymentSettings = z.infer<typeof paymentsSchema>
