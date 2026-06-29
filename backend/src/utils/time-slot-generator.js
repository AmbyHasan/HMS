
 // generates time slot strings from start to end time based on slot duration.
 
const generateTimeSlots = (startTime, endTime, slotDuration) => {
  const slots = [];

  const [startHour, startMin] = startTime.split(':').map(Number);   //"09:30"  -> [startHours -> 9 ,startMin-> 30]
  const [endHour, endMin] = endTime.split(':').map(Number);


  //converting into minutes for comparison
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);  //changing back to hours
    const mins = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);  //09:30
    currentMinutes += slotDuration;  //move to next slot
  }

  return slots;
};

export default  generateTimeSlots ;
