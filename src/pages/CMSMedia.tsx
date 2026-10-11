import AdminShell from "@/components/cms/AdminShell";
import MediaLibrary from "@/components/cms/MediaLibrary";
export default function CMSMedia() {
  return (
    <AdminShell
      title="Your visual library."
      subtitle="One home for every image. Ready for every story."
    >
      <section className="cms-panel p-6">
        <MediaLibrary />
      </section>
    </AdminShell>
  );
}
