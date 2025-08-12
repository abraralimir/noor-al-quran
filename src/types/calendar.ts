
export interface HijriDate {
    date: string; // e.g., "13-09-1445"
    format: string; // e.g., "DD-MM-YYYY"
    day: string; // e.g., "13"
    weekday: {
        en: string; // e.g., "Al Juma'a"
        ar: string; // e.g., "الجمعة"
    };
    month: {
        number: number; // e.g., 9
        en: string; // e.g., "Ramaḍān"
        ar: string; // e.g., "رَمَضان"
    };
    year: string; // e.g., "1445"
    designation: {
        abbreviated: string; // e.g., "AH"
        expanded: string; // e.g., "Anno Hegirae"
    };
    holidays: string[];
}

export interface GregorianDate {
    date: string; // e.g., "22-03-2024"
    format: string; // e.g., "DD-MM-YYYY"
    day: string; // e.g., "22"
    weekday: {
        en: string; // e.g., "Friday"
    };
    month: {
        number: number; // e.g., 3
        en: string; // e.g., "March"
    };
    year: string; // e.g., "2024"
    designation: {
        abbreviated: string; // e.g., "AD"
        expanded: string; // e.g., "Anno Domini"
    };
}

export interface CalendarDay {
    timings: Record<string, string>;
    date: {
        readable: string;
        timestamp: string;
        gregorian: GregorianDate;
        hijri: HijriDate;
    };
}

export interface AlAdhanCalendarResponse {
    code: number;
    status: string;
    data: CalendarDay[] | CalendarDay; // Can be an array or a single object for a specific day
}
