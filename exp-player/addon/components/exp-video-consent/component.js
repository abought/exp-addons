import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video consent frame for Lookit studies, with consent document displayed at left and instructions to start recording, read a statement out loud, and send. Example of MIT consent form, as of 2/28/2017:

```json
"frames": {
    "video-consent": {
        "blocks": [
            {
                 "text": "Observing your child's behavior during this experimental session will help us to understand how infants and children use evidence to learn and make predictions about the world.",
                "title": "About the study"
            },
            {
                "text": "Your and your child's participation in this session are completely voluntary. If you and your child choose to participate, you may stop the session at any point with no penalty. Please pause or stop the session if your child becomes very fussy or does not want to participate. If this is a study with multiple sessions, there are no penalties for not completing all sessions.",
                "title": "Participation"
            },
            {
                "text": "During the session, you and your child will be recorded via your computer's webcam and microphone while watching a video or completing an activity. Video recordings and other data you enter are sent securely to our lab. At the end of the session, or when you end it early, you will be prompted to choose a privacy level for your webcam recordings. ",
                "title": "Webcam recording"
            },
            {
                "text": "Recordings and survey responses will be stored on a password-protected server and accessed only by the Lookit researchers working on this study and any other groups you allow when selecting a privacy level. A researcher may transcribe responses or record information such as where you or your child is looking. Data will not be used to identify you or your child. The results of the research may be presented at scientific meetings or published in scientific journals, but no video clips will be shared unless you allow this when selecting a privacy level.\n\nRaw data may also be published when it can not identify children; for instance, we may publish children’s looking times to the left versus right of the screen, or parent comments with children’s names removed. We may also study your child’s responses in connection with his or her previous responses to this or other studies, siblings’ responses, or demographic survey responses. We never publish children’s birthdates or names, and we never publish your demographic data in conjunction with your child’s video.",
                "title": "Use of data"
            },
            {
                "text": "If you or your child have any questions or concerns about this research, you may contact Professor Laura Schulz: lschulz@mit.edu or (617) 324-4859.",
                "title": "Contact information"
            }
        ],
        "id": "video-consent",
        "prompt": "\"I have read and understand the consent document. I am this child's parent or legal guardian and we both agree to participate in this study.\"",
        "kind": "exp-video-consent"
    }
}
```

@class ExpVideoConsent
@extends ExpFrameBase

@uses VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    videoRecorder: Em.inject.service(),
    recorder: null,
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),
    disableRecord: Em.computed('recorder.recording', 'hasCamAccess', function () {
        return !this.get('hasCamAccess') || this.get('recorder.recording');
    }),
    recordingStarted: false,

    didInsertElement() {
        var recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('.recorder'));
        recorder.install({record: false});
        this.set('recorder', recorder);
    },
    actions: {
        record() {
            this.get('recorder').record();
            window.setTimeout(() => {
                this.set('recordingStarted', true);
            }, 2000);
        },
        finish() {
            this.get('recorder').stop().then(() => {
                this.send('next');
            });
        }
    },

    meta: {
        name: 'Video Consent Form',
        description: 'A video consent form.',
        parameters: {
            type: 'object',
            properties: {
                /**
                A unique identifier for this item
                @property {String} id
                */
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },

                /**
                Title of the consent document
                @property {String} title
                @default 'Consent to participate in behavioral research: <br> Inference and induction study'
                */
                title: {
                    type: 'string',
                    default: 'Consent to participate in behavioral research: <br> Inference and induction study'
                },

                /**
                Array of paragraphs of the consent document, each with title and text.
                @property {Array} blocks
                    @param {String} title
                    @param {String} text
                @default []
                */
                blocks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            }
                        }
                    },
                    default: []
                },

                /**
                Text the user is asked to read aloud to consent
                @property {String} prompt
                @default 'I consent to participate in this study'
                */
                prompt: {
                    type: 'string',
                    default: 'I consent to participate in this study'
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    }
});
