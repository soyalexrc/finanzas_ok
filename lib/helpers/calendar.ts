import {Colors} from "@/lib/constants/colors";

export const transformEventsToCalendarFormat = (events: any[]) => {
    const formattedEvents: any = {};

    events.forEach((event: any) => {
        event.occurrences.forEach((occurrence: any) => {
            const dateKey = occurrence.date.split("T")[0]; // Extract YYYY-MM-DD

            if (!formattedEvents[dateKey]) {
                formattedEvents[dateKey] = {
                    selected: true,
                    selectedColor: 'rgba(220,76,62,0.2)', // Default red
                    selectedTextColor: '#000',
                    marked: true,
                    dots: [],
                };
            }

            formattedEvents[dateKey].dots.push({
                key: event._id, // Use event ID as key
                color: occurrence.color || Colors.primary, // Default color
                checked: occurrence.checked, // Include checked flag
            });
        });
    });

    // ✅ Set selectedColor to GREEN if all dots for a date are checked
    Object.keys(formattedEvents).forEach((dateKey) => {
        const allChecked = formattedEvents[dateKey].dots.length > 0 &&
            formattedEvents[dateKey].dots.every((dot: any) => dot.checked);

        formattedEvents[dateKey].selectedColor = allChecked
            ? 'rgba(0,128,0,0.2)'  // Green if all dots are checked
            : 'rgba(220,76,62,0.2)'; // Default red otherwise
    });

    return formattedEvents;
};
