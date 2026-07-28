/** Full-screen fallback shown while a lazily-loaded route chunk downloads. */
const PageLoader = () => (
  <div className="min-h-screen grid place-items-center bg-gray-100 dark:bg-gray-900">
    <div className="animate-spin w-14 h-14 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full" />
  </div>
);

export default PageLoader;
