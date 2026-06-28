//returns today's date as YYYY-MM-DD string
 
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};


 //checks if a date string (YYYY-MM-DD) is in the past.
const isPastDate = (dateStr) => {
  const today = getTodayDate();
  return dateStr < today;
};

//return the day of week name for the given date string
const getDayOfWeek = (dateStr) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const date = new Date(dateStr + 'T00:00:00Z');
  return days[date.getUTCDay()];
};

export default { getTodayDate, isPastDate, getDayOfWeek };
