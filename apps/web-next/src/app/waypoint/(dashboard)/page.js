import Link from "next/link";
import { Building2, Map, BookOpen, Inbox, Plus, ArrowRight, CheckCircle2, PhoneCall, XCircle, Star, TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Itinerary from "@/models/Itinerary";
import CatalogItem from "@/models/CatalogItem";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import PageView from "@/models/PageView";
import { verifyAdminSession } from "@/lib/dal";

const SOURCE_COLORS = {
  direct:    "bg-slate-400",
  google:    "bg-blue-500",
  bing:      "bg-teal-500",
  instagram: "bg-pink-500",
  facebook:  "bg-blue-700",
  whatsapp:  "bg-green-500",
  twitter:   "bg-sky-400",
  linkedin:  "bg-blue-600",
  youtube:   "bg-red-500",
};

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500",  icon: Inbox },
  contacted: { label: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-500",   icon: PhoneCall },
  confirmed: { label: "Confirmed", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",  icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-50 text-gray-500 border-gray-200",    dot: "bg-gray-400",   icon: XCircle },
};

function timeAgo(date, nowMs) {
  const diff = nowMs - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatDate(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function buildLast14Days(agg) {
  const map = Object.fromEntries(agg.map(({ _id, count }) => [_id, count]));
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map[key] ?? 0 });
  }
  return days;
}

export default async function AdminDashboardPage() {
  await verifyAdminSession();
  await dbConnect();

  const now = new Date();
  const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo    = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);

  const [
    propertyCount,
    itineraryCount,
    catalogCount,
    bookingStatusAgg,
    thisMonthCount,
    lastMonthCount,
    enquiriesByDayAgg,
    topPropertiesAgg,
    reviewAgg,
    recentBookings,
    trafficSourcesAgg,
    topPagesAgg,
    viewsThisMonth,
  ] = await Promise.all([
    Property.countDocuments(),
    Itinerary.countDocuments(),
    CatalogItem.countDocuments(),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Booking.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Booking.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $match: { property: { $exists: true, $ne: null } } },
      { $group: { _id: "$property", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "properties", localField: "_id", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $project: { _id: 0, name: "$p.name", count: 1 } },
    ]),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    Booking.find().sort("-createdAt").limit(6).populate("property", "name").lean(),
    PageView.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$path", slug: { $first: "$slug" }, refType: { $first: "$refType" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    PageView.countDocuments({ createdAt: { $gte: thisMonthStart } }),
  ]);

  const statusCounts = Object.fromEntries(bookingStatusAgg.map(({ _id, count }) => [_id, count]));
  const totalBookings = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const momDelta = lastMonthCount === 0 ? null : Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
  const confirmed = statusCounts.confirmed ?? 0;
  const actionable = totalBookings - (statusCounts.cancelled ?? 0);
  const conversionRate = actionable > 0 ? Math.round((confirmed / actionable) * 100) : null;
  const nowMs = now.getTime();
  const todayStr = now.toISOString().slice(0, 10);

  const trend14 = buildLast14Days(enquiriesByDayAgg);
  const maxTrendCount = Math.max(...trend14.map((d) => d.count), 1);

  const reviewStats = reviewAgg[0] ?? null;

  const trafficSources = trafficSourcesAgg.map(({ _id, count }) => ({ source: _id, count }));
  const totalViews30d  = trafficSourcesAgg.reduce((s, r) => s + r.count, 0);
  const topPages       = topPagesAgg.map(({ _id, slug, refType, count }) => ({ path: _id, slug, refType, count }));

  const stats = [
    { label: "Properties",      value: propertyCount,      icon: Building2, href: "/waypoint/properties" },
    { label: "Itineraries",     value: itineraryCount,     icon: Map,        href: "/waypoint/itineraries" },
    { label: "Catalog items",   value: catalogCount,       icon: BookOpen,   href: "/waypoint/catalog" },
    { label: "Total enquiries", value: totalBookings,      icon: Inbox,      href: "/waypoint/bookings", sub: { thisMonth: thisMonthCount, delta: momDelta } },
    { label: "Page views",      value: viewsThisMonth,     icon: Eye,        href: "#analytics",      sub: { label: `${totalViews30d} in 30 days` } },
  ];

  const quickActions = [
    { label: "New property",   href: "/waypoint/properties/new",      icon: Plus },
    { label: "New itinerary",  href: "/waypoint/itineraries/builder", icon: Plus },
    { label: "View enquiries", href: "/waypoint/bookings",            icon: ArrowRight },
    { label: "Manage catalog", href: "/waypoint/catalog",             icon: ArrowRight },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const delta = stat.sub?.delta;
          const DeltaIcon = delta == null ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
          const deltaColor = delta == null ? "" : delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-muted-foreground";
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold leading-none">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1 leading-tight">{stat.label}</div>
                {stat.sub && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${deltaColor}`}>
                    {DeltaIcon && <DeltaIcon className="w-3 h-3" />}
                    <span>
                      {stat.sub.label
                        ? stat.sub.label
                        : `${stat.sub.thisMonth} this month${delta != null ? ` (${delta > 0 ? "+" : ""}${delta}%)` : ""}`}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pipeline + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Enquiry pipeline</h2>
            {conversionRate !== null && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {conversionRate}% conversion rate
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = statusCounts[key] ?? 0;
              const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
              return (
                <Link
                  key={key}
                  href="/waypoint/bookings"
                  className={`flex flex-col gap-2 p-4 rounded-xl border ${cfg.color} hover:opacity-80 transition`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-2xl font-bold leading-none">{count}</div>
                  <div className="text-xs font-medium">{cfg.label}</div>
                  <div className="text-xs opacity-70">{pct}% of total</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4">Quick actions</h2>
          <div className="flex flex-col gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition text-sm font-medium"
                >
                  {action.label}
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 14-day trend chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold">Enquiries — last 14 days</h2>
            <span className="text-xs text-muted-foreground">
              {trend14.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>
          <div className="flex items-end gap-1 h-28">
            {trend14.map((day) => {
              const heightPct = Math.max((day.count / maxTrendCount) * 100, day.count > 0 ? 8 : 2);
              const isToday = day.date === todayStr;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {day.count > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                      {day.count}
                    </div>
                  )}
                  <div
                    className={`w-full rounded-sm transition-all ${isToday ? "bg-primary" : "bg-primary/30 group-hover:bg-primary/60"}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatDate(trend14[0].date)}</span>
            <span>{formatDate(trend14[6].date)}</span>
            <span>{formatDate(trend14[13].date)}</span>
          </div>
        </div>

        {/* Right column: top properties + review snapshot */}
        <div className="flex flex-col gap-4">

          {reviewStats && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-3">Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none">{reviewStats.avg.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">avg · {reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 flex-1">
            <h2 className="text-base font-semibold mb-3">Top enquired</h2>
            {topPropertiesAgg.length === 0 ? (
              <p className="text-sm text-muted-foreground">No property enquiries yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topPropertiesAgg.map((item, i) => {
                  const barPct = Math.round((item.count / topPropertiesAgg[0].count) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate font-medium pr-2">{item.name}</span>
                        <span className="text-muted-foreground shrink-0">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traffic & page view analytics */}
      <div id="analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Traffic sources */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">Traffic sources</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">last 30 days · {totalViews30d} views</span>
          </div>
          {trafficSources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No page views recorded yet. Views will appear here once visitors access public pages.</p>
          ) : (
            <div className="space-y-3">
              {trafficSources.map(({ source, count }) => {
                const pct = Math.round((count / trafficSources[0].count) * 100);
                const barColor = SOURCE_COLORS[source] || "bg-primary/50";
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2 font-medium capitalize">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${barColor}`} />
                        {source}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{count} <span className="text-xs">({Math.round((count / totalViews30d) * 100)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} opacity-70`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">Top pages</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">last 7 days</span>
          </div>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No page views recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topPages.map(({ path, slug, refType, count }, i) => {
                const label = slug && slug !== path.replace(/^\//, "") ? slug : path;
                const badge =
                  refType === "property" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  refType === "package"  ? "bg-blue-50 text-blue-700 border-blue-200"   :
                  "bg-muted text-muted-foreground border-border";
                const badgeLabel = refType === "property" ? "property" : refType === "package" ? "package" : "page";
                return (
                  <div key={path} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 shrink-0 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="truncate font-medium">{label}</span>
                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge}`}>{badgeLabel}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent enquiries */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Recent enquiries</h2>
          <Link href="/waypoint/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted-foreground text-sm">No enquiries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Guest</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">For</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Travelers</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Received</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => {
                const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.new;
                const subject = b.property?.name ?? (b.bookingType === "package" ? "Package enquiry" : "General enquiry");
                return (
                  <tr key={b._id.toString()} className="border-t border-border hover:bg-muted/40 transition">
                    <td className="px-6 py-3">
                      <div className="font-medium">{b.guestName}</div>
                      <div className="text-muted-foreground text-xs">{b.email}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{subject}</td>
                    <td className="px-6 py-3 text-muted-foreground">{b.numberOfTravelers}</td>
                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">{timeAgo(b.createdAt, nowMs)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
