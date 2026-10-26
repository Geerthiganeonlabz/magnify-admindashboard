export const apiV1Url = (path: string) => {
  const cleaned = path.replace(/^\//, '').replace(/^api\//, '');
  return `/api/v1/${cleaned}`;
};
