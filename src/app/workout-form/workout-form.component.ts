import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Workout {
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

@Component({
  selector: 'app-workout-form',
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.css']
})
export class WorkoutFormComponent {
  workout: Workout = { userName: '', workoutType: '', workoutMinutes: 0 };
  workouts: Workout[] = [];
  filteredWorkouts: Workout[] = [];
  searchName: string = '';
  filterType: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 10, 15, 20];
  
  // ECharts options
  barChartOption: any;
  lineChartOption: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.filteredWorkouts = this.workouts;
    if (this.isBrowser) {
      this.updateCharts();
    }
  }

  onSubmit() {
    this.workouts.push({ ...this.workout });
    this.filteredWorkouts = this.workouts;
    if (this.isBrowser) {
      this.updateCharts();
    }
    this.resetForm();
  }

  onSearchNameChange() {
    this.filterWorkouts();
  }

  onFilterTypeChange() {
    this.filterWorkouts();
  }

  filterWorkouts() {
    this.filteredWorkouts = this.workouts.filter(workout => {
      return (!this.searchName || workout.userName.toLowerCase().includes(this.searchName.toLowerCase())) &&
             (!this.filterType || workout.workoutType === this.filterType);
    });
    if (this.isBrowser) {
      this.updateCharts();
    }
  }

  setItemsPerPage(event: any) {
    this.itemsPerPage = event.target.value;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedWorkouts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredWorkouts.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredWorkouts.length / this.itemsPerPage);
  }

  resetForm() {
    this.workout = { userName: '', workoutType: '', workoutMinutes: 0 };
  }

  updateCharts() {
    const workoutTypes = Array.from(new Set(this.workouts.map(w => w.workoutType)));
    const workoutMinutes = workoutTypes.map(type => {
      return this.workouts
        .filter(w => w.workoutType === type)
        .reduce((total, w) => total + w.workoutMinutes, 0);
    });

    // Bar chart for total workout minutes by type
    this.barChartOption = {
      title: {
        text: 'Total Workout Minutes by Type'
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: workoutTypes
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: workoutMinutes,
        type: 'bar'
      }]
    };

    // Line chart for workout progress over time
    const userNames = Array.from(new Set(this.workouts.map(w => w.userName)));
    const workoutProgress = userNames.map(user => {
      return {
        name: user,
        type: 'line',
        data: this.workouts
          .filter(w => w.userName === user)
          .map(w => w.workoutMinutes)
      };
    });

    this.lineChartOption = {
      title: {
        text: 'Workout Progress Over Time'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: userNames
      },
      xAxis: {
        type: 'category',
        data: this.workouts.map((_, index) => index + 1) // Assuming each workout is a new session
      },
      yAxis: {
        type: 'value'
      },
      series: workoutProgress
    };
  }
}
