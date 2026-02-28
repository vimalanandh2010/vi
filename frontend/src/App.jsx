import React from 'react'
import SeekerCommunity from './pages/Seeker/Community'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import RoleSelection from './pages/RoleSelection'
import AuthCallback from './pages/AuthCallback'

import SeekerSignup from './pages/Seeker/Signup'
import SeekerLogin from './pages/Seeker/Login'
import SeekerDashboard from './pages/Seeker/Dashboard'
import SeekerHome from './pages/Seeker/Home'
import ProfileSetup from './pages/Seeker/ProfileSetup'
import Jobs from './pages/Seeker/Jobs'
import Applications from './pages/Seeker/Applications'
import SavedJobs from './pages/Seeker/SavedJobs'
import Courses from './pages/Seeker/Courses'
import SeekerLanding from './pages/Seeker/Landing'
import NonITJobs from './pages/Seeker/NonITJobs'
import SeekerProfile from './pages/Seeker/Profile'
import ProfileBuilder from './pages/Seeker/ProfileBuilder'
import SeekerChat from './pages/Seeker/Chat'
import Companies from './pages/Seeker/Companies'
import CompanyDetail from './pages/Seeker/CompanyDetail'
import CommunityList from './pages/Seeker/CommunityList'
import CommunityDetail from './pages/Seeker/CommunityDetail'


// Recruiter Pages
import RecruiterHome from './pages/Recruiter/Home'
import RecruiterProfile from './pages/Recruiter/Profile'
import CompanyProfile from './pages/Recruiter/CompanyProfile'
import RecruiterDashboard from './pages/Recruiter/Dashboard'
import PostJob from './pages/Recruiter/PostJob'
import MyPostings from './pages/Recruiter/MyPostings'
import MyCourses from './pages/Recruiter/MyCourses'
import RecruiterLogin from './pages/Recruiter/Login'
import RecruiterSignup from './pages/Recruiter/Signup'
import PostCourse from './pages/Recruiter/PostCourse'
import JobApplicants from './pages/Recruiter/JobApplicants'
import CourseStudents from './pages/Recruiter/CourseStudents'
import RecruiterLanding from './pages/Recruiter/Landing'
import RecruiterChat from './pages/Recruiter/Chat'
import RecruiterCommunity from './pages/Recruiter/Community'
import RecruiterCandidates from './pages/Recruiter/Candidates'
import RecruiterJobs from './pages/Recruiter/Jobs'
import JobAnalytics from './pages/Recruiter/JobAnalytics'
import RecruiterCalendar from './pages/Recruiter/Calendar'
import JobDetails from './pages/Recruiter/JobDetails'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CompanyProvider } from './context/CompanyContext'
import { ChatProvider } from './context/ChatContext'
import CommunityPage from './features/community/CommunityPage';
import ChatPage from './features/chat/ChatPage';
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import InterviewRoom from './pages/InterviewRoom'
import InterviewAlerts from './components/InterviewAlerts'
import SeekerHelperChat from './components/SeekerHelperChat'
import RecruiterHelperChat from './components/RecruiterHelperChat'




// OTP Auth Pages
import EnterEmail from './pages/Auth/EnterEmail'
import VerifyOtp from './pages/Auth/VerifyOtp'
import ForgotPassword from './pages/Auth/ForgotPassword'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <ErrorBoundary>
                    <RoleSelection />
                  </ErrorBoundary>
                } />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/login-otp" element={<EnterEmail />} />
                <Route path="/auth/verify-otp" element={<VerifyOtp />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/interview/:applicationId" element={
                  <ErrorBoundary>
                    <InterviewRoom />
                  </ErrorBoundary>
                } />

                {/* Job Seeker Public Routes */}
                <Route path="/seeker" element={
                  <ErrorBoundary>
                    <SeekerLanding />
                  </ErrorBoundary>
                } />
                <Route path="/seeker/login" element={
                  <ErrorBoundary>
                    <SeekerLogin />
                  </ErrorBoundary>
                } />
                <Route path="/seeker/signup" element={
                  <ErrorBoundary>
                    <SeekerSignup />
                  </ErrorBoundary>
                } />


                {/* Recruiter Public Routes */}
                <Route path="/recruiter/login" element={
                  <ErrorBoundary>
                    <RecruiterLogin />
                  </ErrorBoundary>
                } />
                <Route path="/recruiter/signup" element={
                  <ErrorBoundary>
                    <RecruiterSignup />
                  </ErrorBoundary>
                } />
                <Route path="/recruiter" element={
                  <ErrorBoundary>
                    <RecruiterLanding />
                  </ErrorBoundary>
                } />

                {/* Protected Job Seeker Routes */}
                <Route element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['seeker']} />
                  </ErrorBoundary>
                }>
                  <Route path="/seeker/home" element={<SeekerHome />} />
                  <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
                  <Route path="/seeker/profile-setup" element={<ProfileSetup />} />
                  <Route path="/seeker/jobs" element={<Jobs />} />
                  <Route path="/seeker/applications" element={<Applications />} />
                  <Route path="/seeker/saved-jobs" element={<SavedJobs />} />
                  <Route path="/seeker/courses" element={<Courses />} />
                  <Route path="/seeker/non-it-jobs" element={<NonITJobs />} />
                  <Route path="/seeker/companies" element={<Companies />} />
                  <Route path="/seeker/company/:id" element={<CompanyDetail />} />


                  <Route path="/seeker/profile" element={<ProfileBuilder />} />
                  <Route path="/seeker/profile-builder" element={<ProfileBuilder />} />
                  <Route path="/seeker/chat" element={<ChatPage />} />
                  <Route path="/seeker/community" element={<CommunityList />} />
                  <Route path="/seeker/communities" element={<CommunityList />} />
                  <Route path="/seeker/communities/:id" element={<CommunityDetail />} />
                </Route>

                {/* Protected Recruiter Routes */}
                <Route element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['employer', 'recruiter']} />
                  </ErrorBoundary>
                }>
                  <Route path="/recruiter/home" element={<RecruiterHome />} />
                  <Route path="/recruiter/landing" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/post-job" element={<PostJob />} />
                  <Route path="/recruiter/post-course" element={<PostCourse />} />
                  <Route path="/recruiter/my-jobs" element={<MyPostings />} />
                  <Route path="/recruiter/my-courses" element={<MyCourses />} />
                  <Route path="/recruiter/job/:jobId/applicants" element={<JobApplicants />} />
                  <Route path="/recruiter/course/:courseId/students" element={<CourseStudents />} />
                  <Route path="/recruiter/chat" element={<ChatPage />} />
                  <Route path="/recruiter/community" element={<CommunityList isSeeker={false} />} />
                  <Route path="/recruiter/communities" element={<CommunityList isSeeker={false} />} />
                  <Route path="/recruiter/communities/:id" element={<CommunityDetail isSeeker={false} />} />
                  <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
                  <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                  <Route path="/recruiter/job-analytics/:jobId" element={<JobAnalytics />} />
                  <Route path="/recruiter/job-applicants/:jobId" element={<JobApplicants />} />
                  <Route path="/recruiter/profile" element={<RecruiterProfile />} />
                  <Route path="/recruiter/company-profile" element={<CompanyProfile />} />
                  <Route path="/recruiter/calendar" element={<RecruiterCalendar />} />
                  <Route path="/recruiter/job-details/:jobId" element={<JobDetails />} />

                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Global Interview Alerts Component */}
              <InterviewAlerts />

              {/* Seeker AI Chatbot Widget */}
              <SeekerHelperChat />

              {/* Recruiter AI Chatbot Widget */}
              <RecruiterHelperChat />

              <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            </div>
          </ChatProvider>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
