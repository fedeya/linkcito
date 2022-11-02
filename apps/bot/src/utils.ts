import { getLinkPreview } from 'link-preview-js';

export function isURL(str: string) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}

export interface Preview {
  url: string;
  title?: string;
  siteName: string | undefined;
  description?: string | undefined;
  mediaType: string;
  contentType: string | undefined;
  images?: string[];
  videos: {
    url: string | undefined;
    secureUrl: string | null | undefined;
    type: string | null | undefined;
    width: string | undefined;
    height: string | undefined;
  }[];
  favicons: string[];
}

export const getPreview = (link: string): Promise<Preview> =>
  getLinkPreview(link, {
    followRedirects: 'manual',
    handleRedirects: (baseURL: string, forwardedURL: string) => {
      const urlObj = new URL(baseURL);
      const forwardedURLObj = new URL(forwardedURL);
      if (
        forwardedURLObj.hostname === urlObj.hostname ||
        forwardedURLObj.hostname === 'www.' + urlObj.hostname ||
        'www.' + forwardedURLObj.hostname === urlObj.hostname
      ) {
        return true;
      } else {
        return false;
      }
    }
  }) as any;
