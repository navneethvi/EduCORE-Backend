export interface CreateCourseRequest {
    body: {
      price: number;
      title: string;
      description: string;
      category: string;
      level: string;
      lessons: {
        title: string;
        goal: string;
        video: string;
        materials: string;
        homework: string;
      }[];
    };
    files: { [fieldname: string]: File[]; } | File[] | undefined;
    tutor_id: string;
  }