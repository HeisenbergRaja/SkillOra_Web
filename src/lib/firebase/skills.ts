import { collection, query, where, getDocs, getDoc, doc, onSnapshot, runTransaction, setDoc } from 'firebase/firestore';
import { db } from './config';
import { Skill, Enrollment } from '@/types/skill';

export const getPublishedSkills = async (): Promise<Skill[]> => {
  try {
    const skillsRef = collection(db, 'skills');
    const q = query(skillsRef, where("status", "==", "published"));
    const querySnapshot = await getDocs(q);
    
    const skills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      skills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    
    // Sort descending by createdAt
    return skills.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching published skills:", error);
    throw error;
  }
};

export const subscribeToPublishedSkills = (callback: (skills: Skill[]) => void) => {
  const skillsRef = collection(db, 'skills');
  const q = query(skillsRef, where("status", "==", "published"));
  
  return onSnapshot(q, (querySnapshot) => {
    const skills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      skills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    callback(skills.sort((a, b) => b.createdAt - a.createdAt));
  }, (error) => {
    console.error("Error listening to published skills:", error);
    callback([]);
  });
};

export const getSkillById = async (skillId: string): Promise<Skill | null> => {
  try {
    const docRef = doc(db, 'skills', skillId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Skill;
    }
    return null;
  } catch (error) {
    console.error("Error fetching skill:", error);
    return null;
  }
};

export const getSkillsByCreator = async (creatorId: string): Promise<Skill[]> => {
  try {
    const q = query(
      collection(db, 'skills'),
      where('creatorId', '==', creatorId),
      where('status', '==', 'published')
    );
    const querySnapshot = await getDocs(q);
    const skills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      skills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    return skills.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching creator skills:", error);
    return [];
  }
};

export const subscribeToSkillsByCreator = (creatorId: string, callback: (skills: Skill[]) => void) => {
  const q = query(
    collection(db, 'skills'),
    where('creatorId', '==', creatorId),
    where('status', '==', 'published')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const skills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      skills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    callback(skills.sort((a, b) => b.createdAt - a.createdAt));
  }, (error) => {
    console.error("Error listening to creator skills:", error);
    callback([]);
  });
};

export const subscribeToUserEnrollments = (uid: string, callback: (enrollments: Enrollment[]) => void) => {
  const enrollmentsRef = collection(db, 'enrollments');
  const q = query(enrollmentsRef, where("userId", "==", uid));
  
  return onSnapshot(q, (querySnapshot) => {
    const enrollments: Enrollment[] = [];
    querySnapshot.forEach((doc) => {
      enrollments.push(doc.data() as Enrollment);
    });
    callback(enrollments);
  }, (error) => {
    console.error("Error listening to enrollments:", error);
    callback([]);
  });
};

export const updateEnrollmentProgress = async (uid: string, skillId: string, dayId: string): Promise<Enrollment> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${uid}_${skillId}`);
    const skillRef = doc(db, 'skills', skillId);

    const updatedEnrollment = await runTransaction(db, async (transaction) => {
      const enrollmentDoc = await transaction.get(enrollmentRef);
      const skillDoc = await transaction.get(skillRef);

      if (!enrollmentDoc.exists()) throw new Error("Enrollment not found");
      if (!skillDoc.exists()) throw new Error("Skill not found");

      const enrollment = enrollmentDoc.data() as Enrollment;
      const skill = skillDoc.data() as Skill;

      let currentDayProgress = [...(enrollment.dayProgress || [])];
      
      // If empty, initialize it
      if (currentDayProgress.length === 0 && skill.roadmap) {
        currentDayProgress = skill.roadmap.map(r => ({ dayId: r.id, completed: false }));
      }

      let dayIndex = currentDayProgress.findIndex(dp => dp.dayId === dayId);
      if (dayIndex === -1) {
        if (skill.roadmap?.some(r => r.id === dayId)) {
          currentDayProgress.push({ dayId, completed: false });
          dayIndex = currentDayProgress.length - 1;
        } else {
          throw new Error("Day not found in roadmap");
        }
      }

      const day = currentDayProgress[dayIndex];
      if (day.completed) return enrollment;

      currentDayProgress[dayIndex] = { ...day, completed: true, completedAt: Date.now() };

      const totalDaysCount = skill.roadmap?.length || 0;
      const newCompletedDays = currentDayProgress.filter(dp => dp.completed).length;
      const newProgress = totalDaysCount > 0 ? Math.floor((newCompletedDays * 100) / totalDaysCount) : 0;
      const isRoadmapCompleted = newCompletedDays === totalDaysCount;

      const newEnrollmentData: Partial<Enrollment> = {
        dayProgress: currentDayProgress,
        completedDays: newCompletedDays,
        totalDays: totalDaysCount,
        progress: newProgress,
        roadmapCompleted: isRoadmapCompleted
      };

      transaction.update(enrollmentRef, newEnrollmentData);

      return { ...enrollment, ...newEnrollmentData } as Enrollment;
    });

    return updatedEnrollment;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

export const enrollInSkill = async (uid: string, skillId: string, creditsRequired: number): Promise<void> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${uid}_${skillId}`);
    const skillRef = doc(db, 'skills', skillId);
    const userRef = doc(db, 'users', uid);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const skillDoc = await transaction.get(skillRef);
      const enrollmentDoc = await transaction.get(enrollmentRef);

      if (!userDoc.exists()) throw new Error("User not found");
      if (!skillDoc.exists()) throw new Error("Skill not found");
      if (enrollmentDoc.exists()) throw new Error("Already enrolled in this skill");

      const userData = userDoc.data();
      const skillData = skillDoc.data() as Skill;

      if (skillData.creatorId === uid) {
        throw new Error("You cannot enroll in a skill you created.");
      }

      const currentCredits = userData.credits || 0;
      if (currentCredits < creditsRequired) {
        throw new Error(`Insufficient credits. Required: ${creditsRequired}`);
      }

      // Deduct credits
      transaction.update(userRef, { credits: currentCredits - creditsRequired });

      // Create enrollment
      const totalDays = skillData.roadmap?.length || 0;
      const enrollment: Enrollment = {
        userId: uid,
        skillId: skillId,
        enrolledAt: Date.now(),
        totalDays: totalDays,
        completedDays: 0,
        progress: 0,
        dayProgress: skillData.roadmap ? skillData.roadmap.map(r => ({ dayId: r.id, completed: false })) : [],
        roadmapCompleted: totalDays === 0,
        completed: totalDays === 0,
        quizPassed: false
      };

      transaction.set(enrollmentRef, enrollment);
    });
  } catch (error) {
    console.error("Error enrolling in skill:", error);
    throw error;
  }
};

export const createSkill = async (
  skillData: Omit<Skill, 'id' | 'creatorId' | 'creatorName' | 'createdAt' | 'updatedAt' | 'status' | 'completionCredits'>,
  uid: string,
  creatorName: string
): Promise<Skill> => {
  try {
    const skillsRef = collection(db, 'skills');
    const newSkillDoc = doc(skillsRef);
    const now = Date.now();

    const newSkill: Skill = {
      ...skillData,
      id: newSkillDoc.id,
      creatorId: uid,
      creatorName: creatorName,
      createdAt: now,
      updatedAt: now,
      status: 'published',
      completionCredits: 50, // default placeholder
    };

    await setDoc(newSkillDoc, newSkill);
    return newSkill;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};
