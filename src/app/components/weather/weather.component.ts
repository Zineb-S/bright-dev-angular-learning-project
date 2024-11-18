import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent  implements OnInit {
  weatherData: any[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeatherData();
  }

  loadWeatherData() {
    const cities = ['Rabat', 'Boston'];
    cities.forEach((city) => {
      this.weatherService.getWeather(city).subscribe((data) => {
        const time = this.getTimeForCity(data.timezone);
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const dayPartIcon = this.getDayPartIcon(data.timezone);
  
        this.weatherData.push({
          name: data.name,
          temp: data.main.temp,
          condition: data.weather[0].description,
          time,
          icon: iconUrl,
          dayPartIcon,
          dayPart: this.getDayPart(data.timezone),
        });
      });
    });
  }
  
  getDayPartIcon(timezone: number): string {
    const hour = this.getLocalHour(timezone);
    if (hour >= 5 && hour < 12) {
      return 'assets/icons/morning.png';
    } else if (hour >= 12 && hour < 17) {
      return './assets/icons/afternoon.png';
    } else if (hour >= 17 && hour < 20) {
      return './assets/icons/evening.png';
    } else {
      return './assets/icons/night.png';
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
    const utcOffset = timezone / 3600;
    const currentTime = new Date();
    const localTime = new Date(
      currentTime.setHours(currentTime.getUTCHours() + utcOffset)
    );
    return localTime.getHours();
  }
  

  getTimeForCity(timezone: number): string {
    const utcOffset = timezone / 3600; // Convert seconds to hours
    const currentTime = new Date();
    const localTime = new Date(currentTime.setHours(currentTime.getUTCHours() + utcOffset));
    return localTime.toLocaleTimeString();
  }
}