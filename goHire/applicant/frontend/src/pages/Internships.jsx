import { useEffect, useState } from 'react';
import { applicantApi } from '../services/applicantApi';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';
import InternshipCard from '../components/internships/InternshipCard';
import InternshipFilters from '../components/internships/InternshipFilters';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});


  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await applicantApi.getInternships();
        setInternships(data);
      } catch (error) {
        console.error('Error fetching internships:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }



  return (
    <div>
      <Header title="Available Internships" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Filters Left */}
        <div className="w-full lg:w-1/4">
          <InternshipFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Internship List Right */}
        <div className="flex-1">
          {internships.length === 0 ? (
            <EmptyState message="No internships available at the moment" />
          ) : (
            <div className="flex flex-col gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internships;
