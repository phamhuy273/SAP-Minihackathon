sap.ui.define([], function () {
  "use strict";

  return function (sql) {
    return {
      membersByClub: sql(`
        SELECT name, members
        FROM clubs
        ORDER BY members DESC
      `),

      // 🧩 YOUR QUERIES START
      // Page 1 KPIs: Single row summarizing key metrics
      kpiSummary: sql.one(`
        SELECT 
          ROUND(AVG(CASE WHEN weekday = 'Fri' THEN fill_pct END), 1) as friday_fill,
          ROUND(AVG(CASE WHEN weekday = 'Thu' THEN fill_pct END), 1) as thursday_fill,
          ROUND(AVG(CASE WHEN topic = 'Workshop' THEN avg_rating END), 2) as workshop_rating,
          ROUND(AVG(CASE WHEN topic = 'Workshop' THEN registered * 100.0 / capacity END), 1) as workshop_signup
        FROM events 
        WHERE club_id = 'C01'
      `),

      // Page 1 Evidence A: Coding Club attendance by weekday
      attendanceByDay: sql(`
        SELECT 
          CASE weekday 
            WHEN 'Wed' THEN 'Wednesday'
            WHEN 'Thu' THEN 'Thursday'
            WHEN 'Fri' THEN 'Friday'
          END as day_name,
          ROUND(AVG(fill_pct), 1) as avg_fill,
          ROUND(AVG(showup_pct), 1) as avg_showup,
          COUNT(*) as total_events
        FROM events
        WHERE club_id = 'C01'
        GROUP BY weekday
        ORDER BY CASE weekday WHEN 'Wed' THEN 1 WHEN 'Thu' THEN 2 WHEN 'Fri' THEN 3 END
      `),

      // Page 1 Evidence B: Topic comparison
      topicComparison: sql(`
        SELECT 
          topic,
          ROUND(AVG(avg_rating), 2) as rating,
          ROUND(AVG(registered * 100.0 / capacity), 1) as signup_pct,
          ROUND(AVG(fill_pct), 1) as fill_pct,
          COUNT(*) as total_events
        FROM events
        WHERE club_id = 'C01'
        GROUP BY topic
        ORDER BY rating DESC
      `),

      // Page 1 & 2: Weekly fill % trend (reproduces the president's problem chart)
      weeklyTrend: sql(`
        SELECT 
          'Wk ' || week as week_name,
          ROUND(SUM(checked_in) * 100.0 / SUM(capacity), 1) as fill_pct,
          80 as target_pct
        FROM events
        WHERE club_id = 'C01'
        GROUP BY week
        ORDER BY week
      `),

      // Page 2 Ambition: Campus-wide Friday collapse across clubs
      campusByClubFriday: sql(`
        SELECT 
          c.name as club_name,
          ROUND(AVG(CASE WHEN e.weekday != 'Fri' THEN e.fill_pct END), 1) as weekday_fill,
          ROUND(AVG(CASE WHEN e.weekday = 'Fri' THEN e.fill_pct END), 1) as friday_fill
        FROM events e
        JOIN clubs c ON e.club_id = c.club_id
        GROUP BY c.name
        HAVING friday_fill IS NOT NULL
        ORDER BY friday_fill ASC
      `),

      // Page 2 Ambition: Promotion reach by event
      promotionAnalysis: sql(`
        SELECT 
          'Wk ' || e.week || ' ' || e.weekday as event_label,
          e.topic,
          e.fill_pct,
          SUM(p.reach) as total_reach,
          COUNT(p.post_id) as post_count
        FROM events e
        LEFT JOIN promotion_posts p ON e.event_id = p.event_id
        WHERE e.club_id = 'C01'
        GROUP BY e.event_id
        ORDER BY e.week, e.weekday
      `),

      // Page 3: Room M105 bookings for Spring 2027
      roomAvailabilityM105: sql(`
        SELECT 
          weekday, 
          start_time, 
          end_time, 
          booked_by
        FROM room_bookings
        WHERE room = 'M105'
        ORDER BY CASE weekday WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3 WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 END
      `)
      // 🧩 YOUR QUERIES END
    };
  };
});
