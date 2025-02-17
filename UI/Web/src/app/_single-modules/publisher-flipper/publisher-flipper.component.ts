import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {ImageComponent} from "../../shared/image/image.component";
import {FilterField} from "../../_models/metadata/v2/filter-field";
import {Person} from "../../_models/metadata/person";
import {ImageService} from "../../_services/image.service";
import {FilterComparison} from "../../_models/metadata/v2/filter-comparison";
import {FilterUtilitiesService} from "../../shared/_services/filter-utilities.service";
import {Router} from "@angular/router";

const ANIMATION_TIME = 3000;

@Component({
  selector: 'app-publisher-flipper',
  standalone: true,
  imports: [
    ImageComponent
  ],
  templateUrl: './publisher-flipper.component.html',
  styleUrl: './publisher-flipper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublisherFlipperComponent implements OnInit, OnDestroy {

  protected readonly imageService = inject(ImageService);
  private readonly filterUtilityService = inject(FilterUtilitiesService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  @Input() publishers: Array<Person> = [];


  currentPublisher: Person | undefined = undefined;
  nextPublisher: Person | undefined = undefined;

  currentIndex = 0;
  isFlipped = false;
  private intervalId: any;


  ngOnInit() {
    if (this.publishers.length > 0) {
      this.currentPublisher = this.publishers[0];
      this.nextPublisher = this.publishers[1] || this.publishers[0];
      if (this.publishers.length > 1) {
        this.startFlipping();
      }
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startFlipping() {
    this.intervalId = setInterval(() => {
      // First flip
      this.isFlipped = true;
      this.cdRef.markForCheck();

      // Update content after flip animation completes
      setTimeout(() => {
        // Update indices and content
        this.currentIndex = (this.currentIndex + 1) % this.publishers.length;
        this.currentPublisher = this.publishers[this.currentIndex];
        this.nextPublisher = this.publishers[(this.currentIndex + 1) % this.publishers.length];

        // Reset flip
        this.isFlipped = false;

        this.cdRef.markForCheck();
      }, ANIMATION_TIME); // Full transition time to ensure flip completes
    }, ANIMATION_TIME);
  }

  openPublisher(filter: string | number) {
    // TODO: once we build out publisher person-detail page, we can redirect there
    this.filterUtilityService.applyFilter(['all-series'], FilterField.Publisher, FilterComparison.Equal, `${filter}`).subscribe();
  }
}
