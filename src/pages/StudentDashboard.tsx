import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourses, useQuizAttempts, useLectureProgress, useLectures } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen, Trophy, Video, CheckCircle, TrendingUp, Calendar, Clock, Award } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: progress = [] } = useLectureProgress();

  const completedLectures = progress.filter((p) => p.completed).length;
  const totalLectures = lectures.length;
  const lecturePercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + (b.total > 0 ? (b.score / b.total) * 100 : 0), 0) / attempts.length)
    : 0;

  const purchasedCourses = courses.filter((c) => hasPurchased(c.id));

  const chartData = attempts.slice(0, 6).reverse().map((a, i) => ({
    quiz: `Q${i + 1}`,
    score: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back!</h1>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>
          <div className="hidden sm:block">
            <Award className="w-12 h-12 text-primary animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Courses", value: purchasedCourses.length.toString(), color: "gradient-primary", subtext: "Enrolled" },
          { icon: Trophy, label: "Avg Score", value: `${avgQuizScore}%`, color: "gradient-success", subtext: "Performance" },
          { icon: Video, label: "Lectures", value: `${completedLectures}/${totalLectures}`, color: "gradient-info", subtext: "Completed" },
          { icon: CheckCircle, label: "Quizzes", value: attempts.length.toString(), color: "gradient-warning", subtext: "Attempted" },
        ].map((stat, index) => (
          <Card key={stat.label} className="p-4 hover-lift cursor-pointer border-0 shadow-lg animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Progress Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Learning Progress
            </h3>
            <span className="text-sm font-medium text-muted-foreground">{lecturePercent}%</span>
          </div>
          <div className="space-y-3">
            <Progress value={lecturePercent} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {completedLectures} of {totalLectures} lectures completed
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Keep going!</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Updated today</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Performance
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="quiz" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Courses</h3>
          <button 
            onClick={() => navigate('/courses')}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all →
          </button>
        </div>
        <div className="grid gap-4">
          {purchasedCourses.map((course, index) => (
            <Card 
              key={course.id} 
              className="p-5 hover-lift cursor-pointer border-0 shadow-lg animate-scale-in" 
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
                  {course.thumbnail_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-base mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{course.category}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-1.5 max-w-24">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">65%</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {purchasedCourses.length === 0 && (
            <Card className="p-8 text-center border-0 shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">No courses yet</h4>
              <p className="text-muted-foreground mb-4">Start your learning journey by enrolling in a course</p>
              <button 
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Browse Courses
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
