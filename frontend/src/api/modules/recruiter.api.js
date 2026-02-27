import axiosClient from '../axiosClient';

const recruiterApi = {
    // Dashboard Stats
    getDashboardStats: () => axiosClient.get('employer/dashboard-stats'),

    // Jobs
    getJobs: () => axiosClient.get('employer/jobs'),
    createJob: (jobData) => axiosClient.post('jobs', jobData),
    updateJob: (id, jobData) => axiosClient.put(`jobs/${id}`, jobData),
    deleteJob: (id) => axiosClient.delete(`jobs/${id}`),

    // Candidates / Applications
    getJobApplicants: (jobId) => axiosClient.get(`jobs/${jobId}/applicants`),
    updateApplicationStatus: (id, status) => axiosClient.put(`applications/${id}/status`, { status }),

    // Company Profile
    getCompanyProfile: () => axiosClient.get('companies/my-company'),
    updateCompanyProfile: (data) => axiosClient.put('companies/my-company', data),

    // Verification
    verifyCompany: (data) => axiosClient.post('verification/submit', data),
};

export default recruiterApi;
