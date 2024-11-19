import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'], // Corrected typo from "styleUrl" to "styleUrls"
})
export class WeatherComponent implements OnInit, OnDestroy {
  weatherData: any[] = [];
  private intervalId: any; // To store the interval for real-time updates

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeatherData();
    this.startRealTimeClock(); // Added real-time clock updates
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval when the component is destroyed
    }
  }

  loadWeatherData() {
    const cities = ['Rabat', 'Boston'];
    cities.forEach((city) => {
      this.weatherService.getWeather(city).subscribe((data) => {
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const dayPartIcon = this.getDayPartIcon(data.timezone);

        this.weatherData.push({
          name: data.name,
          temp: data.main.temp,
          condition: data.weather[0].description,
          timezone: data.timezone, // Added timezone to simplify real-time updates
          icon: iconUrl,
          dayPartIcon,
          dayPart: this.getDayPart(data.timezone),
          time: this.calculateLocalTime(data.timezone), // Calculate time on load
        });
      });
    });
    console.log(this.weatherData)
  }

  startRealTimeClock(): void {
    this.intervalId = setInterval(() => {
      this.weatherData.forEach((city) => {
        city.time = this.calculateLocalTime(city.timezone); // Update time in real-time
        city.dayPart = this.getDayPart(city.timezone); // Update day part in real-time
        city.dayPartIcon = this.getDayPartIcon(city.timezone); // Update day part icon
      });
    }, 1000); // Update every second
  }

  calculateLocalTime(timezone: number): string {
    const utcOffset = timezone / 3600; // Convert seconds to hours
    const currentTime = new Date();
    const localTime = new Date(currentTime.setHours(currentTime.getUTCHours() + utcOffset));
    return localTime.toLocaleTimeString();
  }

  getDayPartIcon(timezone: number): string {
    const hour = this.getLocalHour(timezone);
    if (hour >= 5 && hour < 12) {
      return 'assets/icons/morning.png';
    } else if (hour >= 12 && hour < 17) {
      return 'assets/icons/afternoon.png';
    } else if (hour >= 17 && hour < 20) {
      return 'assets/icons/evening.png';
    } else {
      return 'assets/icons/night.png';
    }
  }

  getDayPart(timezone: number): string {
    const hour = this.getLocalHour(timezone);
    if (hour >= 5 && hour < 12) {
      return 'Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Afternoon';
    } else if (hour >= 17 && hour < 20) {
      return 'Evening';
    } else {
      return 'Night';
    }
  }

  getLocalHour(timezone: number): number {
    const utcOffset = timezone / 3600; // Convert seconds to hours
    const currentTime = new Date();
    const localTime = new Date(currentTime.setHours(currentTime.getUTCHours() + utcOffset));
    return localTime.getHours();
  }
}
