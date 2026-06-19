const stats = [
  { label: '今日待审核', value: '0' },
  { label: '待处理订单', value: '0' },
  { label: '公告数量', value: '0' },
  { label: '系统状态', value: '正常' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">控制台</h2>
        <p className="mt-2 text-sm text-slate-500">
          当前为后台基础壳，后续可接入业务统计、审核队列和订单处理入口。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-800">
              {item.value}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
