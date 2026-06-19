export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-6 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function LectureListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3" />
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="h-8 bg-slate-200 rounded w-8 mx-auto mb-2" />
          <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto" />
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="h-8 bg-slate-200 rounded w-8 mx-auto mb-2" />
          <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function VideoPlayerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-video bg-slate-200 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}
