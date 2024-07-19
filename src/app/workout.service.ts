import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface UserWorkout {
  name: string;
  workouts: string[];
  totalMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private users: UserWorkout[] = [];
  private usersSubject = new BehaviorSubject<UserWorkout[]>(this.users);

  users$ = this.usersSubject.asObservable();

  addWorkout(name: string, workoutType: string, workoutMinutes: number): void {
    const user = this.users.find(u => u.name === name);
    if (user) {
      user.workouts.push(workoutType);
      user.totalMinutes += workoutMinutes;
    } else {
      this.users.push({
        name,
        workouts: [workoutType],
        totalMinutes: workoutMinutes
      });
    }
    this.usersSubject.next([...this.users]);
  }
}
