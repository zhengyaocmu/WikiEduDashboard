import '../../testHelper';
import sinon from 'sinon';

import React from 'react';
import CourseCreator from '../../../app/assets/javascripts/components/course_creator/course_creator.jsx';

import { shallow } from 'enzyme';

CourseCreator.__Rewire__('ValidationStore', {
  isValid() { return true; },
  firstMessage() { }
});

/**
* returns the style attribute applied to a given node.
  params:
    node (enzyme node) the node you would like to inspect
  returns empty string if no styles are found
**/

const getStyle = (node) => {
  const rootTag = node.html().match(/(<.*?>)/)[1]; // grab the top tag
  const styleMatch = rootTag.match(/style="([^"]*)"/i);
  return styleMatch ? styleMatch[1] : '';
};


describe('CourseCreator', () => {
  describe('render', () => {
    const updateCourseSpy = sinon.spy();
    const setValidSpy = sinon.spy();
    const setInvalidSpy = sinon.spy();
    const checkCourseSpy = sinon.spy();

    const TestCourseCreator = shallow(
      <CourseCreator
        courseCreator={{}}
        fetchCoursesForUser={() => {}}
        user_courses={["some_course"]}
        course={reduxStore.getState().course}
        updateCourse={updateCourseSpy}
        setValidKey={setValidSpy}
        setInvalidKey={setInvalidSpy}
        checkSlugAvailability={checkCourseSpy}
        isValid={true}
      />
    );

    it('renders a title', () => {
      expect(TestCourseCreator.find('h3').first().text()).to.eq('Create a New Course');
    });
    describe('user courses-to-clone dropdown', () => {
      describe('state not updated', () => {
        it('does not show', () => {
          expect(
            TestCourseCreator
              .find('.select-container')
              .hasClass('hidden')
          ).to.eq(true);
        });
      });
      describe('state updated to show (and user has courses)', () => {
        it('shows', () => {
          TestCourseCreator.setState({ showCloneChooser: true });
          TestCourseCreator.setState({ user_courses: ['some_course'] });
          expect(
            TestCourseCreator
              .find('.select-container')
              .hasClass('hidden')
            ).to.eq(false);
        });
      });
    });
    describe('formStyle', () => {
      describe('submitting', () => {
        it('includes pointerEvents and opacity', () => {
          TestCourseCreator.setState({ isSubmitting: true });
          const wizardPanel = TestCourseCreator.find('.wizard__panel').first();
          expect(getStyle(wizardPanel)).to.eq('pointer-events:none;opacity:0.5;');
          TestCourseCreator.setState({ isSubmitting: false });
        });
      });
    });
    describe('text inputs', () => {
      TestCourseCreator.setState({ default_course_type: 'ClassroomProgramCourse' });
      describe('subject', () => {
        it('updates courseActions', () => {
          TestCourseCreator.instance().updateCourse('subject', 'some subject');
          expect(updateCourseSpy).to.have.been.called;
          expect(setValidSpy).not.to.have.been.called;
        });
      });
      describe('term', () => {
        it('updates courseActions and validationActions', () => {
          TestCourseCreator.setState({ default_course_type: 'ClassroomProgramCourse' });
          TestCourseCreator.instance().updateCourse('term', 'this term');
          expect(updateCourseSpy).to.have.been.called;
          expect(setValidSpy).to.have.been.called;
        });
      });
    });
    describe('save course', () => {
      sinon.stub(TestCourseCreator.instance(), 'expectedStudentsIsValid').callsFake(() => true);
      sinon.stub(TestCourseCreator.instance(), 'dateTimesAreValid').callsFake(() => true);
      it('calls the appropriate methods on the actions', () => {
        const button = TestCourseCreator.find('.button__submit');
        button.simulate('click');
        expect(checkCourseSpy).to.have.been.called;
        expect(setInvalidSpy).to.have.been.called;
      });
    });
  });
});
