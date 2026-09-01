export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-800">연차 관리 시스템</h1>
          <p className="mt-1 text-sm text-slate-500">사내 연차 신청·승인·관리</p>
        </div>
        {children}
      </div>
    </div>
  );
}
